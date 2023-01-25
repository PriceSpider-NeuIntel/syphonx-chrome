import React, { useEffect, useState } from "react";
import { SxProps, Theme  } from "@mui/material";
import { ValidateField } from ".";

type Variant = "string" | "number" | "boolean" | "json" | "formula" | "regexp" | "dynamic-string";

export interface Props {
    variants: Variant[];
    value: any;
    onChange: (event: React.SyntheticEvent<Element, Event>, value: any) => void;
    sx?: SxProps<Theme>
}

export default ({ value, onChange, sx }: Props) => {
    const [input, setInput] = useState<string | undefined>();

    useEffect(() => {
        setInput(value);
    }, [value]);

    return (
        <ValidateField
            variant="standard"
            size="small"
            fullWidth
            value={input}
            onChange={onChange}
            sx={sx}
        />
    );
};