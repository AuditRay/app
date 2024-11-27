import {Box} from "@mui/material";
import dayjs from "dayjs";
import Link from "@/app/ui/Link";

export default function Footer () {
    return (
        <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            flexDirection: 'row',
            flexBasis: '100%',
            alignItems: 'center',
            height: '50px',
            p: 2,
            borderTop: '1px solid #ccc',
            color: '#333',
            backgroundColor: '#f9f9f9'
        }}>
            <Box>© {dayjs().format('YYYY')} Monit.dev. All rights reserved. </Box>
            <Box>
                <Link href={'/terms'}>Terms and conditions</Link> | <Link href={'/privacy'}>Privacy Policy</Link>
            </Box>
        </Box>
    )
}
