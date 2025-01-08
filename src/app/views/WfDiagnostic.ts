import {DefaultView} from "@/app/models/WebsiteView";

export const WfDiagnostic: DefaultView = {
    id: "wf-diagnostic",
    title: "Wfence Diagnostic",
    weight: 1,
    enabled: true,
    isDefault: true,
    dataSources: [
        {
            "id" : "monit_wfence_diagnostic",
            "fields" : [
                "monit_wfence_diagnostic_wordfence_status",
                "monit_wfence_diagnostic_filesystem",
                "monit_wfence_diagnostic_wordfence_config",
                "monit_wfence_diagnostic_wordfence_firewall",
                "monit_wfence_diagnostic_mysql",
                "monit_wfence_diagnostic_php_environment",
                "monit_wfence_diagnostic_connectivity",
                "monit_wfence_diagnostic_time"
            ]
        }
    ]
}