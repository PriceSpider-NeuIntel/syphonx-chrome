import { sendBackgroundMessage } from "../../background";

export function evaluate<T = any>(expression: string): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        chrome.devtools.inspectedWindow.eval(expression, (result, err) => {
            if (err)
                reject(err);
            else
                resolve(result as T);
        });
    });
}

// NOTE:  The chrome.tabs.* API is not exposed to the Developer Tools extension pages due to security considerations.
// So it is necessary to pass the tab ID to the background page and invoke the chrome.tabs.* API functions from there.
// https://developer.chrome.com/docs/extensions/reference/devtools_inspectedWindow/
// sendBackgroundMessage sends a message to perform the work from the service_worker

export async function goBack(): Promise<void> {
    await sendBackgroundMessage("goback", url);
}

export async function navigate(url: string): Promise<void> {
    await sendBackgroundMessage("navigate", url);
}

export async function reload(): Promise<void> {
    await sendBackgroundMessage("reload");
}

export async function url(): Promise<string> {
    const { tab } = await sendBackgroundMessage<{ tab: chrome.tabs.Tab }>("tab");
    return tab?.url || "";
}
