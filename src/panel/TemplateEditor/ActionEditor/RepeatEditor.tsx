import React from "react";
import { TemplateItem } from "../lib";
import * as syphonx from "syphonx-lib";

import {
    TextField
} from "@mui/material";

import {
    ComplexPropertyGrid,
    FormulaField,
    NumberField
} from "./components";

export interface Props {
    item: TemplateItem;
    onChange: (event: React.SyntheticEvent<Element, Event>) => void;
}

export default ({ item, onChange }: Props) => {
    const obj = item?.obj as syphonx.Repeat;
    return obj ? (
        <ComplexPropertyGrid
            items={[
                [
                    "name",
                    <TextField
                        variant="standard"
                        size="small"
                        placeholder="Name for this action"
                        inputProps={{ maxLength: 32 }}    
                        value={obj.name}
                        onChange={event => {
                            obj.name = event.target.value || undefined;
                            onChange(event);
                        }}
                    />,
                    "An optional descriptive name briefly summarizing the repeat action. Name appears in the action tree and status output, enhances readibility of the template if specified.",
                    true
                ],
                [
                    "limit",
                    <NumberField
                        value={obj.limit}
                        onChange={(event, value) => {
                            obj.limit = value;
                            onChange(event);
                        }}
                        min={0}
                    />,
                    "Limits the number of repeat iterations.",
                    true
                ],
                [
                    "errors",
                    <NumberField
                        value={obj.errors}
                        onChange={(event, value) => {
                            obj.errors = value;
                            onChange(event);
                        }}
                        min={1}
                    />,
                    "Maximum number of errors before aborting the repeat loop. (default=1)",
                    obj.errors !== undefined
                ],
                [
                    "when",
                    <FormulaField
                        value={obj.when}
                        onChange={(event, value) => {
                            obj.when = value;
                            onChange(event);
                        }}
                    />,
                    "A formula that determines whether to perform the repeat actions, performs the repeat actions unconditionally if not specified.",
                    obj.when !== undefined
                ],
                /*
                [
                    "active",
                    <Switch
                        size="small"
                        checked={obj.active ?? true}
                        onChange={(event, value) => {
                            obj.active = value;
                            onChange(event);
                        }}
                    />,
                    "Determines whether the property is active or bypassed.",
                    obj.active !== undefined
                ]
                */
            ]}
        />
    ) : null;
};