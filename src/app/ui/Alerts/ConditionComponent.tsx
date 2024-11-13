//this component should render a from to input TopLevelCondition and any nested conditions inside it in a recursive way
// write the component here

import React, {useEffect, useState} from 'react';
import { TopLevelCondition } from "json-rules-engine";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Input,
    TextField,
    Select,
    FormControl, InputLabel, FormControlLabel, Autocomplete
} from '@mui/material';
import {AllConditions, AnyConditions, ConditionProperties, NotConditions} from "@/app/types";
import MenuItem from "@mui/material/MenuItem";
import {minWidth} from "@mui/system";

export default function ConditionComponent(
    { condition, setCondition, factOptions = [], firstLevel = false } :
    { factOptions: { id: string, label: string }[],firstLevel?:boolean, condition: TopLevelCondition, setCondition: (condition: TopLevelCondition) => void }
) {
    const [conditionType, setConditionType] = useState<'all' | 'any' | 'condition'>('all');
    const [notCondition, setNotCondition] = useState<boolean>(false);

    useEffect(() => {
        if ((condition as NotConditions).not !== undefined) {
            setNotCondition(true);
            if (((condition as NotConditions).not as AllConditions).all !== undefined) {
                setConditionType('all');
            } else if (((condition as NotConditions).not as AnyConditions).any !== undefined) {
                setConditionType('any');
            } else if (((condition as NotConditions).not as ConditionProperties).operator !== undefined) {
                setConditionType('condition');
            }
        } else {
            if ((condition as AllConditions).all !== undefined) {
                setConditionType('all');
            } else if ((condition as AnyConditions).any !== undefined) {
                setConditionType('any');
            } else if ((condition as any).operator !== undefined) {
                setConditionType('condition');
            }
        }
    }, []);


    const handleAddCondition = () => {
        if (notCondition) {
            if (conditionType === 'all') {
                setCondition({
                    not: {
                        all: [...(((condition as NotConditions)?.not as AllConditions)?.all || []), {
                            fact: '',
                            operator: '',
                            value: ''
                        }]
                    }
                });
            } else {
                setCondition({
                    not: {
                        any: [...(((condition as NotConditions)?.not as AnyConditions)?.any || []), {
                            fact: '',
                            operator: '',
                            value: ''
                        }]
                    }
                });
            }
        } else {
            if (conditionType === 'all') {
                setCondition({
                    all: [...((condition as AllConditions)?.all || []), {fact: '', operator: '', value: ''}]
                });
            } else {
                setCondition({
                    any: [...((condition as AnyConditions)?.any || []), {fact: '', operator: '', value: ''}]
                });
            }
        }
    }
    const handleAddConditionGroup = () => {
        if(notCondition) {
            if (conditionType === 'all') {
                setCondition({
                    not: {
                        all: [...(((condition as NotConditions)?.not as AllConditions)?.all || {}), {all: []}]
                    }
                });
            } else {
                setCondition({
                    not: {
                        any: [...(((condition as NotConditions)?.not as AnyConditions)?.any || {}), {any: []}]
                    }
                });
            }
        } else {
            if (conditionType === 'all') {
                setCondition({
                    all: [...((condition as AllConditions)?.all || {}), {all: []}]
                });
            } else {
                setCondition({
                    any: [...((condition as AnyConditions)?.any || {}), {any: []}]
                });
            }
        }
    }


    const handleRemoveCondition = (index: number) => {
        if(notCondition) {
            if (conditionType === 'all') {
                setCondition({
                    not: {
                        all: ((condition as NotConditions).not as AllConditions).all.filter((_, i) => i !== index)
                    }
                });
            } else {
                setCondition({
                    not: {
                        any: ((condition as NotConditions).not as AnyConditions).any.filter((_, i) => i !== index)
                    }
                });
            }
        } else {
            if (conditionType === 'all') {
                setCondition({
                    all: (condition as AllConditions).all.filter((_, i) => i !== index)
                });
            } else {
                setCondition({
                    any: (condition as AnyConditions).any.filter((_, i) => i !== index)
                });
            }
        }
    }


    function updateCondition(conditionType: 'all' | 'any' = 'all') {
        console.log("updateC", conditionType);
        if(notCondition) {
            if (conditionType === 'all') {
                setCondition({
                    not: {
                        all: [
                            ...((condition as AnyConditions)?.any || []),
                            ...((condition as AllConditions)?.all || []),
                            ...(((condition as NotConditions)?.not as AnyConditions)?.any || []),
                            ...(((condition as NotConditions)?.not as AllConditions)?.all || []),
                        ]
                    }
                });
            } else {
                setCondition({
                    not: {
                        any: [
                            ...((condition as AnyConditions)?.any || []),
                            ...((condition as AllConditions)?.all || []),
                            ...(((condition as NotConditions)?.not as AnyConditions)?.any || []),
                            ...(((condition as NotConditions)?.not as AllConditions)?.all || []),
                        ]
                    }
                });
            }
        } else {
            if (conditionType === 'all') {
                setCondition({
                    all: [
                        ...((condition as AnyConditions)?.any || []),
                        ...((condition as AllConditions)?.all || []),
                        ...(((condition as NotConditions)?.not as AnyConditions)?.any || []),
                        ...(((condition as NotConditions)?.not as AllConditions)?.all || []),
                    ]
                });
            } else {
                console.log("condition", condition);
                setCondition({
                    any: [
                        ...((condition as AnyConditions)?.any || []),
                        ...((condition as AllConditions)?.all || []),
                        ...(((condition as NotConditions)?.not as AnyConditions)?.any || []),
                        ...(((condition as NotConditions)?.not as AllConditions)?.all || []),
                    ]
                });
            }
        }
    }
    return (
        <Box sx={{
            paddingLeft: firstLevel ? 3 : 3 ,
            paddingBottom: 3 ,
            borderLeft: firstLevel ? '1px solid #000' : '1px solid #000',
            borderBottom: '1px solid #000',
        }}>
            <Box sx={{
                display: 'flex',
                justifyContent: 'end',
            }}>
                {/*<Button onClick={handleAddConditionGroup}>Add Group</Button>*/}
                <Button onClick={handleAddCondition}>Add New Condition</Button>
            </Box>
            <Box>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'start',
                    padding: 2,
                    borderBottom: '1px solid #000',
                }}>
                    {/*<FormControlLabel control={*/}
                    {/*    <Switch*/}
                    {/*        checked={notCondition}*/}
                    {/*        onChange={(e) => {*/}
                    {/*            setNotCondition(e.target.checked);*/}
                    {/*            updateCondition();*/}
                    {/*        }}*/}
                    {/*    />*/}
                    {/*} label="Not" />*/}
                    <FormControl margin="dense" sx={{
                        minWidth: 120,
                    }}>
                        <InputLabel id="condition-type-label">Condition Type</InputLabel>
                        <Select
                            id={`condition-type`}
                            name={`condition-type`}
                            label="Condition Type"
                            value={conditionType}
                            margin={'dense'}
                            onChange={(e) => {
                                //replace the field with the new value
                                setConditionType(e.target.value as 'all' | 'any');
                                updateCondition(e.target.value as 'all' | 'any');
                            }}
                         variant={'outlined'}>
                            <MenuItem value={'all'}>All</MenuItem>
                            <MenuItem value={'any'}>Any</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
                {/* render condition inputs here and sub conditions recursively */}
                {conditionType === 'all' && (condition as AllConditions).all?.map((c, i) => (
                    <Box sx={{
                        borderBottom: '1px solid #000',
                    }} key={i}>
                        {(c as any).all !== undefined && (
                            <ConditionComponent factOptions={factOptions} condition={c as TopLevelCondition} setCondition={(c) => {
                                if(notCondition) {
                                    setCondition({
                                        not: {
                                            all: (condition as NotConditions).not !== undefined ? [
                                                ...((condition as NotConditions).not as AllConditions).all.slice(0, i),
                                                c,
                                                ...((condition as NotConditions).not as AllConditions).all.slice(i + 1)
                                            ] : []
                                        }
                                    });
                                } else {
                                    setCondition({
                                        all: [
                                            ...(condition as AllConditions).all.slice(0, i),
                                            c,
                                            ...(condition as AllConditions).all.slice(i + 1)
                                        ]
                                    });
                                }
                            }} />
                        )}
                        {(c as any).operator !== undefined && (
                            <Box sx={{
                                padding: 2
                            }}>
                                <Autocomplete
                                    disablePortal
                                    fullWidth
                                    disableClearable={true}
                                    options={factOptions.map((option) => option.label)}
                                    defaultValue={(c as ConditionProperties).fact}

                                    onChange={(e, value) => {
                                        if(notCondition) {
                                            setCondition({
                                                not: {
                                                    all: (condition as NotConditions).not !== undefined ? [
                                                        ...((condition as NotConditions).not as AllConditions).all.slice(0, i),
                                                        {
                                                            ...c,
                                                            fact: value
                                                        },
                                                        ...((condition as NotConditions).not as AllConditions).all.slice(i + 1)
                                                    ] : [
                                                        {
                                                            ...c,
                                                            fact: value
                                                        }
                                                    ]
                                                }
                                            });
                                        } else {
                                            setCondition({
                                                all: [
                                                    ...(condition as AllConditions).all.slice(0, i),
                                                    {
                                                        ...c,
                                                        fact: value
                                                    },
                                                    ...(condition as AllConditions).all.slice(i + 1)
                                                ]
                                            });
                                        }
                                    }}
                                    value={(c as ConditionProperties).fact}
                                    renderInput={(params) => <TextField margin="dense" {...params} fullWidth label="Fact" />}
                                />
                                <FormControl margin="dense" sx={{
                                    minWidth: 120
                                }}>
                                    <InputLabel id="operator-label">Operator</InputLabel>
                                    <Select margin={"dense"} label={"Operator"} variant={'outlined'} value={(c as ConditionProperties).operator} onChange={(e) => {
                                        if(notCondition) {
                                            setCondition({
                                                not: {
                                                    all: (condition as NotConditions).not !== undefined ? [
                                                        ...((condition as NotConditions).not as AllConditions).all.slice(0, i),
                                                        {
                                                            ...c,
                                                            operator: e.target.value
                                                        },
                                                        ...((condition as NotConditions).not as AllConditions).all.slice(i + 1)
                                                    ] : [
                                                        {
                                                            ...c,
                                                            operator: e.target.value
                                                        }
                                                    ]
                                                }
                                            });
                                        } else {
                                            setCondition({
                                                all: [
                                                    ...(condition as AllConditions).all.slice(0, i),
                                                    {
                                                        ...c,
                                                        operator: e.target.value
                                                    },
                                                    ...(condition as AllConditions).all.slice(i + 1)
                                                ]
                                            });
                                        }
                                    }
                                    }>
                                        <MenuItem value={'empty'}>Empty</MenuItem>
                                        <MenuItem value={'not-empty'}>Not Empty</MenuItem>
                                        <MenuItem value={'contains'}>Contain</MenuItem>
                                        <MenuItem value={'no-contains'}>Does not Contain</MenuItem>
                                        <MenuItem value={'==='}>=</MenuItem>
                                        <MenuItem value={'!='}>!=</MenuItem>
                                        <MenuItem value={'>'}>&gt;</MenuItem>
                                        <MenuItem value={'<'}>&lt;</MenuItem>
                                        <MenuItem value={'>='}>&gt;=</MenuItem>
                                        <MenuItem value={'<='}>&lt;=</MenuItem>
                                    </Select>
                                </FormControl>
                                {((c as ConditionProperties).operator === 'empty' || (c as ConditionProperties).operator === 'not-empty') ? null : (
                                    <TextField
                                        autoFocus
                                        margin="dense"
                                        name="value"
                                        label="Value"
                                        type="text"
                                        value={(c as ConditionProperties).value}
                                        onChange={(e) => {
                                            if(notCondition) {
                                                setCondition({
                                                    not: {
                                                        all: (condition as NotConditions).not !== undefined ? [
                                                            ...((condition as NotConditions).not as AllConditions).all.slice(0, i),
                                                            {
                                                                ...c,
                                                                value: e.target.value
                                                            },
                                                            ...((condition as NotConditions).not as AllConditions).all.slice(i + 1)
                                                        ] : [
                                                            {
                                                                ...c,
                                                                value: e.target.value
                                                            }
                                                        ]
                                                    }
                                                });
                                            } else {
                                                setCondition({
                                                    all: [
                                                        ...(condition as AllConditions).all.slice(0, i),
                                                        {
                                                            ...c,
                                                            value: e.target.value
                                                        },
                                                        ...(condition as AllConditions).all.slice(i + 1)
                                                    ]
                                                });
                                            }
                                        }}
                                        fullWidth
                                        variant="outlined"
                                    />
                                )}
                            </Box>
                        )}
                        <Button onClick={() => handleRemoveCondition(i)}>Remove</Button>
                    </Box>
                ))}
                {conditionType === 'any' && (condition as AnyConditions).any?.map((c, i) => (
                    <Box sx={{
                        borderBottom: '1px solid #000',
                    }} key={i}>
                        {(c as any).any !== undefined && (
                            <ConditionComponent factOptions={factOptions} condition={c as TopLevelCondition} setCondition={(c) => {
                                if(notCondition) {
                                    setCondition({
                                        not: {
                                            any: (condition as NotConditions).not !== undefined ? [
                                                ...((condition as NotConditions).not as AnyConditions).any.slice(0, i),
                                                c,
                                                ...((condition as NotConditions).not as AnyConditions).any.slice(i + 1)
                                            ] : []
                                        }
                                    });
                                } else {
                                    setCondition({
                                        any: [
                                            ...(condition as AnyConditions).any.slice(0, i),
                                            c,
                                            ...(condition as AnyConditions).any.slice(i + 1)
                                        ]
                                    });
                                }
                            }}/>
                        )}
                        {(c as any).operator !== undefined && (
                            <Box sx={{
                                padding: 2
                            }}>
                                <Autocomplete
                                    disablePortal
                                    fullWidth
                                    disableClearable={true}
                                    options={factOptions.map((option) => option.label)}
                                    defaultValue={(c as ConditionProperties).fact}

                                    onChange={(e, value) => {
                                        if(notCondition) {
                                            setCondition({
                                                not: {
                                                    all: (condition as NotConditions).not !== undefined ? [
                                                        ...((condition as NotConditions).not as AllConditions).all.slice(0, i),
                                                        {
                                                            ...c,
                                                            fact: value
                                                        },
                                                        ...((condition as NotConditions).not as AllConditions).all.slice(i + 1)
                                                    ] : [
                                                        {
                                                            ...c,
                                                            fact: value
                                                        }
                                                    ]
                                                }
                                            });
                                        } else {
                                            setCondition({
                                                all: [
                                                    ...(condition as AllConditions).all.slice(0, i),
                                                    {
                                                        ...c,
                                                        fact: value
                                                    },
                                                    ...(condition as AllConditions).all.slice(i + 1)
                                                ]
                                            });
                                        }
                                    }}
                                    value={(c as ConditionProperties).fact}
                                    renderInput={(params) => <TextField margin="dense" {...params} fullWidth label="Fact" />}
                                />
                                <FormControl margin="dense" sx={{
                                    minWidth: 120
                                }}>
                                    <InputLabel id="operator-label">Operator</InputLabel>
                                    <Select margin={"dense"} label={"Operator"} variant={'outlined'} value={(c as ConditionProperties).operator} onChange={(e) => {
                                        if(notCondition) {
                                            setCondition({
                                                not: {
                                                    any: (condition as NotConditions).not !== undefined ? [
                                                        ...((condition as NotConditions).not as AnyConditions).any.slice(0, i),
                                                        {
                                                            ...c,
                                                            operator: e.target.value
                                                        },
                                                        ...((condition as NotConditions).not as AnyConditions).any.slice(i + 1)
                                                    ] : [
                                                        {
                                                            ...c,
                                                            operator: e.target.value
                                                        }
                                                    ]
                                                }
                                            });
                                        } else {
                                            setCondition({
                                                any: [
                                                    ...(condition as AnyConditions).any.slice(0, i),
                                                    {
                                                        ...c,
                                                        operator: e.target.value
                                                    },
                                                    ...(condition as AnyConditions).any.slice(i + 1)
                                                ]
                                            });
                                        }
                                    }
                                    }>
                                        <MenuItem value={'empty'}>Empty</MenuItem>
                                        <MenuItem value={'not-empty'}>Not Empty</MenuItem>
                                        <MenuItem value={'contains'}>Contain</MenuItem>
                                        <MenuItem value={'no-contains'}>Does not Contain</MenuItem>
                                        <MenuItem value={'==='}>=</MenuItem>
                                        <MenuItem value={'!='}>!=</MenuItem>
                                        <MenuItem value={'>'}>&gt;</MenuItem>
                                        <MenuItem value={'<'}>&lt;</MenuItem>
                                        <MenuItem value={'>='}>&gt;=</MenuItem>
                                        <MenuItem value={'<='}>&lt;=</MenuItem>
                                    </Select>
                                </FormControl>
                                {((c as ConditionProperties).operator === 'empty' || (c as ConditionProperties).operator === 'not-empty') ? null : (
                                    <TextField
                                        autoFocus
                                        margin="dense"
                                        name="value"
                                        label="Value"
                                        type="text"
                                        value={(c as ConditionProperties).value}
                                        onChange={(e) => {
                                            if(notCondition) {
                                                setCondition({
                                                    not: {
                                                        any: (condition as NotConditions).not !== undefined ? [
                                                            ...((condition as NotConditions).not as AnyConditions).any.slice(0, i),
                                                            {
                                                                ...c,
                                                                value: e.target.value
                                                            },
                                                            ...((condition as NotConditions).not as AnyConditions).any.slice(i + 1)
                                                        ] : [
                                                            {
                                                                ...c,
                                                                value: e.target.value
                                                            }
                                                        ]
                                                    }
                                                });
                                            } else {
                                                setCondition({
                                                    any: [
                                                        ...(condition as AnyConditions).any.slice(0, i),
                                                        {
                                                            ...c,
                                                            value: e.target.value
                                                        },
                                                        ...(condition as AnyConditions).any.slice(i + 1)
                                                    ]
                                                });
                                            }
                                        }}
                                        fullWidth
                                        variant="outlined"
                                    />
                                )}
                            </Box>
                        )}
                        <Button onClick={() => handleRemoveCondition(i)}>Remove</Button>
                    </Box>
                ))}
            </Box>
        </Box>
    );
}