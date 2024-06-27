import {DefaultView} from "@/app/models/WebsiteView";

export const SecurityReview: DefaultView = {
    id: "security-review",
    title: "Security Review",
    weight: 1,
    enabled: true,
    isDefault: true,
    dataSources: [
        {
            id: "monit_security_review",
            fields: [
                "monit_security_review_headers",
                "monit_security_review_input_formats",
                "monit_security_review_fields",
                "monit_security_review_failed_logins",
                "monit_security_review_temporary_files",
                "monit_security_review_upload_extensions",
                "monit_security_review_private_files",
                "monit_security_review_query_errors",
                "monit_security_review_file_permissions",
                "monit_security_review_vendor_directory",
                "monit_security_review_name_passwords",
                "monit_security_review_last_cron_run",
                "monit_security_review_admin_user",
                "monit_security_review_executable_php",
                "monit_security_review_admin_permissions",
                "monit_security_review_views_access",
                "monit_security_review_error_reporting",
                "monit_security_review_trusted_hosts",
                "monit_security_review_security_review-headers",
                "monit_security_review_security_review-input_formats",
                "monit_security_review_security_review-fields",
                "monit_security_review_security_review-failed_logins",
                "monit_security_review_security_review-temporary_files",
                "monit_security_review_security_review-upload_extensions",
                "monit_security_review_security_review-private_files",
                "monit_security_review_security_review-query_errors",
                "monit_security_review_security_review-file_permissions",
                "monit_security_review_security_review-vendor_directory",
                "monit_security_review_security_review-name_passwords",
                "monit_security_review_security_review-last_cron_run",
                "monit_security_review_security_review-admin_user",
                "monit_security_review_security_review-executable_php",
                "monit_security_review_security_review-admin_permissions",
                "monit_security_review_security_review-views_access",
                "monit_security_review_security_review-error_reporting",
                "monit_security_review_security_review-trusted_hosts"
            ]
        }
    ]
}