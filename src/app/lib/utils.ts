import {GridFilterModel} from "@mui/x-data-grid-pro";
import {IWebsiteTable} from "@/app/actions/websiteActions";

export function filterWebsiteTable(website: IWebsiteTable, filters: GridFilterModel): Boolean {
    let valid = false;
    for(const filter of filters.items) {
        const logicOperator = filters.logicOperator || 'and';
        const val = website[filter.field]?.value || website[filter.field];
        if(filter.operator === 'notEmpty' || filter.operator === 'isNotEmpty') {
            console.log('notEmpty', filter.field, website[filter.field]);
            if (val?.toString() != "" && val?.toString() != 'N/A') {
                valid = true;
            }
            if (logicOperator == 'and' && (val?.toString() == "" || val?.toString() == 'N/A')) {
                valid = false;
                break;
            }
            if (logicOperator == 'or' && (val?.toString() != "" && val?.toString() != 'N/A')) {
                valid = true;
                break;
            }
        }
        if(filter.operator === 'empty' || filter.operator === 'isEmpty') {
            if(val?.toString() == "" || val?.toString() == 'N/A') {
                valid = true;
            }
            if(logicOperator == 'and' && (val?.toString() != "" && val?.toString() != 'N/A')) {
                valid = false;
                break;
            }
            if(logicOperator == 'or' && (val?.toString() == "" || val?.toString() == 'N/A')) {
                valid = true;
                break;
            }
        }
        if(!filter.value) continue;
        if(filter.operator === 'contains') {
            if(val?.toString().toLowerCase().includes(filter.value.toString().toLowerCase())) {
                valid = true;
            }
            if(logicOperator == 'and' && !val?.toString().toLowerCase().includes(filter.value.toString().toLowerCase())) {
                valid = false;
                break;
            }
            if(logicOperator == 'or' && val?.toString().toLowerCase().includes(filter.value.toString().toLowerCase())) {
                console.log('contains', filter.field, website[filter.field], filter.value.toString().toLowerCase());
                valid = true;
                break;
            }
        }
        if(filter.operator === 'notContains') {
            if(!val?.toString().toLowerCase().includes(filter.value.toString().toLowerCase())) {
                valid = true;
            }
            if(logicOperator == 'and' && val?.toString().toLowerCase().includes(filter.value.toString().toLowerCase())) {
                valid = false;
                break;
            }
            if(logicOperator == 'or' && !val?.toString().toLowerCase().includes(filter.value.toString().toLowerCase())) {
                valid = true;
                break;
            }
        }
        if(filter.operator === '=' || filter.operator === 'equals' || filter.operator === 'is') {
            if(val?.toString().toLowerCase() == filter.value.toString().toLowerCase()) {
                valid = true;
            }
            if(logicOperator == 'and' && val?.toString().toLowerCase() != filter.value.toString().toLowerCase()) {
                valid = false;
                break;
            }
            if(logicOperator == 'or' && val?.toString().toLowerCase() == filter.value.toString().toLowerCase()) {
                valid = true;
                break;
            }
        }
        if(filter.operator == "startsWith") {
            if(val?.toString().toLowerCase().startsWith(filter.value.toString().toLowerCase())) {
                valid = true;
            }
            if(logicOperator == 'and' && !val?.toString().toLowerCase().startsWith(filter.value.toString().toLowerCase())) {
                valid = false;
                break;
            }
            if(logicOperator == 'or' && val?.toString().toLowerCase().startsWith(filter.value.toString().toLowerCase())) {
                valid = true;
                break;
            }
        }
        if(filter.operator == "endsWith") {
            if(val?.toString().toLowerCase().endsWith(filter.value.toString().toLowerCase())) {
                valid = true;
            }
            if(logicOperator == 'and' && !val?.toString().toLowerCase().endsWith(filter.value.toString().toLowerCase())) {
                valid = false;
                break;
            }
            if(logicOperator == 'or' && val?.toString().toLowerCase().endsWith(filter.value.toString().toLowerCase())) {
                valid = true;
                break;
            }
        }
        if(filter.operator === '!=' || filter.operator === 'isNot') {
            if(val?.toString().toLowerCase() != filter.value.toString().toLowerCase()) {
                valid = true;
            }
            if(logicOperator == 'and' && val?.toString().toLowerCase() == filter.value.toString().toLowerCase()) {
                valid = false;
                break;
            }
            if(logicOperator == 'or' && val?.toString().toLowerCase() != filter.value.toString().toLowerCase()) {
                valid = true;
                break;
            }
        }
        if(filter.operator === '>') {
            if(website[filter.field] > filter.value) {
                valid = true;
            }
            if(logicOperator == 'and' && website[filter.field] <= filter.value) {
                valid = false;
                break;
            }
            if(logicOperator == 'or' && website[filter.field] > filter.value) {
                valid = true;
                break;
            }
        }
        if(filter.operator === '<') {
            if(website[filter.field] < filter.value) {
                valid = true;
            }
            if(logicOperator == 'and' && website[filter.field] >= filter.value) {
                valid = false;
                break;
            }
            if(logicOperator == 'or' && website[filter.field] < filter.value) {
                valid = true;
                break;
            }
        }
        if(filter.operator === '>=') {
            if(website[filter.field] >= filter.value) {
                valid = true;
            }
            if(logicOperator == 'and' && website[filter.field] < filter.value) {
                valid = false;
                break;
            }
            if(logicOperator == 'or' && website[filter.field] >= filter.value) {
                valid = true;
                break;
            }
        }
        if(filter.operator === '<=') {
            if(website[filter.field] <= filter.value) {
                valid = true;
            }
            if(logicOperator == 'and' && website[filter.field] > filter.value) {
                valid = false;
                break;
            }
            if(logicOperator == 'or' && website[filter.field] <= filter.value) {
                valid = true;
                break;
            }
        }
        if(filter.operator === 'isAnyOf') {
            if(filter.value.includes(val?.toString().toLowerCase())) {
                valid = true;
            }
            if(logicOperator == 'and' && !filter.value.includes(val?.toString().toLowerCase())) {
                valid = false;
                break;
            }
            if(logicOperator == 'or' && filter.value.includes(val?.toString().toLowerCase())) {
                valid = true;
                break;
            }
        }
    }
    return valid;
}