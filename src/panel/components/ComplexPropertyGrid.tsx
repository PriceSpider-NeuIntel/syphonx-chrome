import React from "react";
import { PropertyGrid, PropertyGridItem } from "../../components";
import { useApp } from "../context";

import {
    Link,
    Stack,
    SxProps,
    Theme,
    Tooltip,
    Typography
} from "@mui/material";

import {
    KeyboardDoubleArrowRight as MoreIcon,
    KeyboardDoubleArrowLeft as LessIcon,
} from "@mui/icons-material";

export type AppPropertyGridItem = [
    JSX.Element | string, // name
    JSX.Element | string | number | boolean, // editor
    string, // help
    boolean // visible
];

export interface Props {
    columns?: Array<{ width: number | string }>,
    items: AppPropertyGridItem[];
    sx?: SxProps<Theme>;
}

export default ({ items, ...props }: Props) => {
    const { advanced, setAdvanced } = useApp();

    const items2 = items
        .filter(item => item[3] || advanced)
        .map(item => [item[0], item[1], item[2]] as PropertyGridItem);

    return (
        <Stack direction="column" alignItems="flex-start">
            <PropertyGrid
                items={items2}
                {...props}
            />
            <Tooltip title={!advanced ? "Show advanced settings" : "Hide advanced settings that are not used"}>
                <Link
                    component="button"
                    variant="body2"
                    onClick={() => setAdvanced(!advanced)}
                >
                    {!advanced && <Typography fontSize="small">More <MoreIcon fontSize="small" sx={{ position: "relative", top: 6 }} /></Typography>}
                    {advanced && <Typography fontSize="small">Less <LessIcon fontSize="small" sx={{ position: "relative", top: 6 }} /></Typography>}
                </Link>
            </Tooltip>
        </Stack>
    );
}