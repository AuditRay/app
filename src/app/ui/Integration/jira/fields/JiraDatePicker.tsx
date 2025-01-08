import {FormControl, FormHelperText} from "@mui/material";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import * as React from "react";
import {DatePicker} from "@mui/x-date-pickers/DatePicker";

export default function JiraDatePicker({label, error, value, setValue}: {label: string, error: any, value: any, setValue: (value: any) => void}) {
    return (
        <FormControl margin={'dense'} fullWidth error={!!error}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                    label={label}
                    format="YYYY-MM-DD"
                    value={value || null}
                    sx={{width: '100%'}}
                    onChange={setValue}
                    defaultValue={value || null}
                />
                {error && (
                    <FormHelperText error>{error}</FormHelperText>
                )}
            </LocalizationProvider>
        </FormControl>
    )
}