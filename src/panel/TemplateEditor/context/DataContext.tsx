import React, { useEffect, useRef, useState } from "react";
import { useApp, useTemplate } from "../context";
import { inspectedWindow, sleep, tryParseJson, validateContract, Template } from "../lib";
import { Schema } from "jsonschema";
import * as syphonx from "syphonx-lib";

export interface DataState {
    extractState: syphonx.ExtractState | undefined;
    extractStatus: syphonx.ExtractStatus | undefined;
    refresh: (reload: boolean) => Promise<void>;
    refreshing: boolean;
    resetExtractStatus: () => void;
}

export const DataContext = React.createContext<DataState>({
    extractState: undefined,
    extractStatus: undefined,
    refresh: async () => {},
    refreshing: false,
    resetExtractStatus: () => {}
});

export function DataProvider({ children }: { children: JSX.Element }) {
    const { autoRefresh } = useApp();
    const { template: json, contract: contractJson } = useTemplate();
    const [extractState, setExtractState] = useState<syphonx.ExtractState | undefined>();
    const [extractStatus, setExtractStatus] = useState<syphonx.ExtractStatus | undefined>();
    const [refreshing, setRefreshing] = useState(false);
    const contractJsonRef = useRef(contractJson);

    useEffect(() => {
        contractJsonRef.current = contractJson; // update the ref each time contractJson changes
    }, [contractJson]);

    useEffect(() => {
        // message is sent from backgroud service_worker script which forwards the message from the DOM window
        chrome.runtime.onMessage.addListener(listener);
        return () => chrome.runtime.onMessage.removeListener(listener);

        function listener(message: any): void {
            if (message.syphonx) {
                if (message.syphonx.key === "extract-status") {
                    setExtractStatus(message.syphonx);
                }
                else if (message.syphonx.key === "extract-state") {
                    setExtractState(message.syphonx);
                    onUpdateExtract(message.syphonx);
                }
            }
        }
    }, []);

    useEffect(() => {
        const template = new Template(json);
        const simple = template.simple();
        if (autoRefresh && simple) // only auto refresh if there is a single select action
            refresh(false);
    }, [json, autoRefresh]);

    async function refresh(reload: boolean) {
        try {
            const template = new Template(json); // loads a default template if no json
            if (template.obj.actions instanceof Array && template.obj.actions.length > 0)
                await onBeginExtract(template, reload);
        }
        catch (err) {
            console.error(err);
        }
    }

    function resetExtractStatus() {
        setExtractState(undefined);
        setExtractStatus(undefined);
        setRefreshing(false);        
    }

    async function onBeginExtract(template: Template, reload: boolean): Promise<void> {
        setExtractState(undefined);
        setExtractStatus(undefined);

        // make sure there's a url otherwise it will hang because the listener won't have been added in the service_worker
        const url = await inspectedWindow.url();
        if (!url)
            return; // todo set extract status 

        setRefreshing(true);
        if (reload)
            await inspectedWindow.reload();

        const script = `${syphonx.script}(${JSON.stringify({ ...template.obj, url, debug: true })})`;
        await inspectedWindow.evaluate(script);
    }

    async function onUpdateExtract(state: syphonx.ExtractState): Promise<void> {
        if (state.yield) {
            if (state.yield.params?.goback) {
                //todo consider how to implement timeout, waitUntil
                await inspectedWindow.goBack();
            }
            else if (state.yield.params?.locators) {
                //todo consider how to implement locators
            }
            else if (state.yield.params?.navigate) {
                //todo consider how to implement timeout, waitUntil
                await inspectedWindow.navigate(state.yield.params.navigate.url);
            }
            else if (state.yield.params?.reload) {
                //todo consider how to implement timeout, waitUntil
                await inspectedWindow.reload();
            }
            else if (state.yield.params?.waitUntil) {
                //todo consider how to implement waitUntil
                await sleep(1000);
            }
            else {
                await sleep(1000);
            }
            const script = `${syphonx.script}(${JSON.stringify({ ...state, debug: true })})`;
            await inspectedWindow.evaluate(script);
        }
        else {
            const contract = tryParseJson(contractJsonRef.current) as Schema | undefined;
            if (contract) {
                const obj = { ...state };
                validateContract(contract, obj);
                setExtractState(obj);
            }
            setRefreshing(false);
        }
    }

    const value = {
        extractState,
        extractStatus,
        refresh,
        refreshing,
        resetExtractStatus
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
}
