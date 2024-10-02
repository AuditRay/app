'use server'
import {getUser} from "@/app/actions/getUser";
import {revalidatePath} from "next/cache";
import {IFieldsTemplate, FieldsTemplate} from "@/app/models";
import {connectMongo} from "@/app/lib/database";
// @ts-ignore

export async function getFieldsTemplate(fieldsTemplateId: string): Promise<IFieldsTemplate> {
    await connectMongo();
    console.log('getFieldsTemplate');
    const user = await getUser();
    if(!user) {
        throw new Error('Unauthorized');
    }
    const fieldsTemplate = await FieldsTemplate.findOne({_id: fieldsTemplateId});
    if(!fieldsTemplate) {
        throw new Error('Fields Template not found');
    }
    return fieldsTemplate.toJSON();
}

export async function getWorkspaceFieldTemplate(): Promise<IFieldsTemplate> {
    await connectMongo();
    console.log('getWorkspaceFieldTemplate');
    const user = await getUser();
    if(!user) {
        throw new Error('Unauthorized');
    }
    const workspace = user.currentSelectedWorkspace;
    if (workspace) {
        const fieldTemplate = await FieldsTemplate.findOne({workspace});
        if(!fieldTemplate) {
            // Create default field template
            const defaultFieldTemplate = new FieldsTemplate({
                workspace: workspace,
                user: user.id,
                name: 'Default',
                fields: [
                ]
            });
            const savedTemplate = await defaultFieldTemplate.save();
            return savedTemplate.toJSON();
        } else {
            return fieldTemplate.toJSON();
        }
    } else {
        const fieldTemplate = await FieldsTemplate.findOne({user: user.id});
        if(!fieldTemplate) {
            // Create default field template
            const defaultFieldTemplate = new FieldsTemplate({
                workspace: null,
                user: user.id,
                name: 'Default',
                fields: [
                ]
            });
            const savedTemplate = await defaultFieldTemplate.save();
            return savedTemplate.toJSON();
        } else {
            return fieldTemplate.toJSON();
        }
    }
}

export async function getFieldsTemplates(): Promise<IFieldsTemplate[]> {
    await connectMongo();
    console.log('getFieldsTemplates');
    const user = await getUser();
    if(!user) {
        throw new Error('Unauthorized');
    }
    const workspace = user.currentSelectedWorkspace;
    if (workspace) {
        const fieldTemplates = await FieldsTemplate.find({workspace});
        return fieldTemplates.map(fieldTemplate => fieldTemplate.toJSON());
    } else {
        const fieldTemplates = await FieldsTemplate.find({user: user.id});
        return fieldTemplates.map(fieldTemplate => fieldTemplate.toJSON());
    }
}

export async function createFieldsTemplate(fieldTemplateData: Partial<IFieldsTemplate>) {
    await connectMongo();
    console.log('createFieldsTemplate');
    const user = await getUser();
    if(!user) {
        throw new Error('Unauthorized');
    }
    const fieldTemplate = new FieldsTemplate({
        workspace: user.currentSelectedWorkspace,
        user: user.id,
        ...fieldTemplateData
    });

    const savedFieldTemplate = await fieldTemplate.save();
    revalidatePath(`/settings/field-templates`);
    return {
        data: savedFieldTemplate.toJSON()
    }
}

export async function deleteFieldsTemplate(fieldTemplateId: string) {
    await connectMongo();
    console.log('deleteFieldsTemplate');
    const user = await getUser();
    if (!user) {
        throw new Error('User not found');
    }
    const fieldTemplate = await FieldsTemplate.findOne({ _id: fieldTemplateId });
    if(!fieldTemplate) {
        throw new Error('View not found');
    }

    await FieldsTemplate.deleteOne({ _id: fieldTemplateId });
    return {
        data: fieldTemplate.toJSON()
    }
}

export async function updateFieldsTemplate(fieldTemplateId: string, fieldTemplateData: Partial<IFieldsTemplate>) {
    await connectMongo();
    console.log('updateFieldsTemplate');
    const user = await getUser();
    if(!user) {
        throw new Error('Unauthorized');
    }
    if(fieldTemplateData.fields) {
        fieldTemplateData.fields = fieldTemplateData.fields.map(field => {
            return {
                ...field,
                _id: field.id.includes('field-preview') ? undefined : field.id
            }
        })
    }
    if (!user.currentSelectedWorkspace) {
        const fieldTemplate = await FieldsTemplate.findOne({_id: fieldTemplateId, user: user.id});
        if (!fieldTemplate) {
            throw new Error('Field Template not found');
        }
        console.log('fieldTemplate', fieldTemplate.fields);
        fieldTemplate.set(fieldTemplateData);
        const savedFieldTemplate = await fieldTemplate.save();
        console.log('fieldTemplate', savedFieldTemplate.fields);
        revalidatePath(`/settings/field-templates`);
        return {
            data: savedFieldTemplate.toJSON()
        }
    } else {
        const fieldTemplate = await FieldsTemplate.findOne({_id: fieldTemplateId, workspace: user.currentSelectedWorkspace});
        if (!fieldTemplate) {
            throw new Error('Field Template not found');
        }
        fieldTemplate.set(fieldTemplateData);
        const savedFieldTemplate = await fieldTemplate.save();

        revalidatePath(`/settings/field-templates`);
        return {
            data: savedFieldTemplate.toJSON()
        }
    }
}
