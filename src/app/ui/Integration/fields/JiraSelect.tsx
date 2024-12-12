import {Autocomplete, FormControl, FormHelperText} from "@mui/material";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import * as React from "react";
import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import TextField from "@mui/material/TextField";

export default function JiraSelect({fieldId, label, error, value, setValue, isDisabled, options, getValue, isMultiple = false}: {isMultiple?: boolean, getValue: (options: any[], value: any) => any, options: any[], fieldId: string, isDisabled?: boolean, label: string, error: any, value: any, setValue: (value: any) => void}) {
    return (
        <FormControl margin={'dense'} fullWidth>
            <Autocomplete
                disabled={isDisabled}
                options={options}
                multiple={isMultiple}
                value={getValue(options, value)}
                id={fieldId}
                onChange={(e: any, newValue: {id: string, label: string} | null) => {
                    if(!newValue) return;
                    console.log('newValue', newValue);
                    setValue(newValue.id);
                }}
                renderInput={(params) => <TextField {...params} label={label} />}
            />
            {error && (
                <FormHelperText error>{error}</FormHelperText>
            )}
        </FormControl>
    )
}