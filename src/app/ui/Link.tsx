'use client'

import MaterialLink from "@mui/material/Link";
import NextLink from "next/link";
import React from "react";

type props = typeof MaterialLink.arguments & typeof NextLink.arguments
export default function Link (props: props) {
    return (
        <MaterialLink component={NextLink} {...props}>
            {props.children}
        </MaterialLink>
    )
}
