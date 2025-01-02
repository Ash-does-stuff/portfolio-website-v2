import { useEffect, useState } from "react"
import { ObjectSchema } from "joi"

/* Input types that are expected to change size on input overflow */
const changeableInputTypes = ["text","email","password","url"]
type StrIndexedObj = {[key: string]: any}

export const useFormHandler = <FormDataType extends {}>(formPreset: FormDataType, submitFunction?: Function, changeInputSize: boolean = true, joiSchema?: ObjectSchema, errSetter?: Function) => {
    const [formData, setFormData] = useState(formPreset)

    const [validated, setValidated] = useState(joiSchema?.validate(formData).error ? false : true)

    let inputSizeMap: StrIndexedObj  = {}

    useEffect(() => {
        onkeyup = (e) => {if (e.key === "Enter") {if (submitFunction) {submitFunction()}}};
    }, [submitFunction])

    const formChange = (e: any) => {
        onChange(formData, setFormData, e)

        // Input size change
        if (!Object.keys(inputSizeMap).includes(e.target.id)) {
            inputSizeMap[e.target.id] = e.target.style.width
            return
        }

        // Validation using Joi schema
        if (joiSchema) {
            const result = joiSchema.validate(formData)

            setValidated(result.error ? false : true)

            if (!errSetter) {console.log("Form handler: No error function to output schema validation err in"); return}
            errSetter((result.error ? result.error.details[0].message : ""))
        }

        if (changeInputSize && changeableInputTypes.includes(e.target.type)) {changeInputWidth(e, inputSizeMap)}
    }

    return {formData, setFormData, formChange, validated}
}

const setOnChangeParams = (e: any, data: Object) => {
    let tag: keyof typeof data = e.target.id;
    let val;
    if (e.target.type === "checkbox") {
        val = e.target.checked;
    } else {
        val = e.target.value;
    }
    return [val,tag]
}

const onChange = (data: Object, setData: Function, e: any) => {
    let [val,tag] = setOnChangeParams(e,data)
    setData((prev: any) => {
        const updated = {...prev}
        updated[tag] = val
        return updated
    });
    return
  };

/*const onChangeOld = (data: Object, setData: Function, e: any) => {
    let temp = data;
    let id: keyof typeof temp = e.target.id;
    temp[id] = e.target.value;
    setData(temp);
    return
  };*/

const changeInputWidth = (e: any, sizeMap: StrIndexedObj) => {
    let newWidth = (e.target.value.length /* (0.95 - e.target.value.length * 0.01)*/) + 'ch'; //random ass multipliers
    e.target.style.width = e.target.value.length > 0 ? newWidth : sizeMap[e.target.id]
    return
}
  