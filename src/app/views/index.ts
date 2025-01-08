import {SecurityReview} from './SecurityReview';
import {SiteAudit} from "./SiteAudit";
import {WfDiagnostic} from "@/app/views/WfDiagnostic";
export const defaultViewsDrupal = [
    SecurityReview,
    SiteAudit
];
export const defaultViewsWP = [
    WfDiagnostic
];
export default defaultViewsDrupal;