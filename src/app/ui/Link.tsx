'use client'

import MaterialLink from "@mui/material/Link";
import NextLink from "next/link";

type props = typeof MaterialLink.arguments & typeof NextLink.arguments
export function Link(props: props) {
    return (
        <MaterialLink component={NextLink} {...props}>
            {props.children}
        </MaterialLink>
    )
}