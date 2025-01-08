import {FormControl, FormHelperText} from "@mui/material";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import * as React from "react";
import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import TextField from "@mui/material/TextField";

export default function JiraText({fieldId, label, error, value, setValue, isDisabled}: {fieldId: string, isDisabled?: boolean, label: string, error: any, value: any, setValue: (value: any) => void}) {
    return (
        <TextField
            autoFocus
            disabled={isDisabled || false}
            error={!!error}
            helperText={error}
            onChange={
                (e) => setValue(e.target.value)
            }
            value={value || ''}
            defaultValue={value || ''}
            margin="dense"
            id={fieldId}
            name={fieldId}
            label={label}
            type="text"
            fullWidth
            variant="outlined"
        />
    )
}