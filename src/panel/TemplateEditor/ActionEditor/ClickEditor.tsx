import React, { useState } from "react";
import { Switch, TextField } from "@mui/material";
import * as syphonx from "syphonx-lib";
import { useApp, useTemplate } from '../../context';
import { ValidateTextField, PropertyGrid, PropertyGridItem } from "../../../components/";
import { Template } from "../../../lib";
import SelectorField from "./SelectorField";
import QueryBuilder from "../QueryBuilder";
import DebugView from "./DebugView";

export default () => {
    const { advanced } = useApp();
    const { template: obj, setTemplate } = useTemplate();
    const [queryEditorOpen, setQueryEditorOpen] = useState(false);

    const template = new Template(obj);
    const item = template.selected();
    if (!item)
        return null;

    function validateName(event: React.ChangeEvent<HTMLInputElement>, value: string): boolean {
        return /^[a-z][a-z0-9_]*$/.test(value);
    }

    const click = item.obj as syphonx.Select;
    const items: PropertyGridItem[] = [
        [
            "query",
            <SelectorField
                query={click.query}
                onClick={() => setQueryEditorOpen(true)}
            />,
            "A CSS selector or jQuery expression that determines the click target"
        ]
    ];

    if (advanced)
        items.push(...[
            [
                "required",
                <Switch
                    checked={click.required ?? false}
                    onChange={(event, value) => { click.required = value; setTemplate(template.toString()); }}
                />,
                "Determines whether the click is optional or required, producing if no click target is found on the page"
            ],
            [
                "retry",
                <Switch
                    checked={click.required ?? false}
                    onChange={(event, value) => { click.required = value; setTemplate(template.toString()); }}
                />,
                "Determines the number of attempts to retry clicking and testing for the expected result"
            ],
            [
                "snooze",
                <TextField size="small" />,
                "Number of seconds to snooze before or after clicking"
            ],
            [
                "waitfor",
                <TextField size="small" />,
                "Wait for a condition to appear on the page before clicking"
            ],
            [
                "when",
                <ValidateTextField
                    variant="standard"
                    size="small"
                    value={click.when}
                    onChange={(event, value) => { click.when = value || undefined; setTemplate(template.toString()); }}
                    onValidate={validateName}
                />,
                "A formula that determines whether the click is evaluated or bypassed"
            ],
            [
                "active",
                <Switch
                    checked={click.active ?? true}
                    onChange={(event, value) => { click.active = value; setTemplate(template.toString()); }}
                />,
                "Determines whether the property is active or bypassed"
            ],
            [
                "debug",
                <DebugView />,
                "Debug"
            ]
        ] as PropertyGridItem[]);

    return (
        <>
            <PropertyGrid items={items} />
            <QueryBuilder
                value={click}
                open={queryEditorOpen}
                onClose={() => setQueryEditorOpen(false)}
                onChange={(event, value) => { click.query = value; setTemplate(template.toString()); }}
            />
        </>
    );
};