import axios from "axios"
import { settings } from '@/app.config';

// get
export const getRequest = async (params: any) => {
    const {
        path,
        jwt = "",
        pageNo = 1,
        perPage = 10,
        filters = null
    } = params

    try {

        const basicQuery = `?page=${pageNo}&perPage=${perPage}`

        let queryFilter = ``
        if (filters)
            Object.keys(filters).map(k =>
                (filters[k] && filters[k] != "") ? queryFilter += `&${k}=${filters[k]}` : ''
            )

        const url = settings.env.backendHost + path + basicQuery + queryFilter
        const params = {
            method: 'GET',
            headers: {
                "Authorization": 'Bearer ' + jwt,
            }
        }


        // const res = await fetch(url, params)
        // const data = await res.json()

        // if (res.status === 200 || res.status === 201)
        //     return { statusCode: res.status, data }
        // else
        //     return { statusCode: res.status, error: data.message }

        // --- Axios ---
        const { status, data } = await axios.get(url, params)

        if (status === 200 || status === 201)
            return { statusCode: status, data }
        else
            return { statusCode: status, error: data.message }
    }
    catch (err) {
        return { statusCode: 500, error: `error in GET Request (${path}) : ${err}` }
    }
}
// post
export const postRequest = async (path: string, body: any, jwt = "", isJson = true) => { // isJson => JSON / formData
    try {
        const url = settings.env.backendHost + path;
        console.log(url);
        const params: any = (Object.keys(body).length) ?
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": 'Bearer ' + jwt,
                },
                body: isJson ? JSON.stringify(body) : body,
            }
            :
            {
                method: 'POST',
                headers: {
                    "Authorization": 'Bearer ' + jwt,
                }
            }

        const res = await fetch(url, params)
        const data = await res.json()

        if (res.status === 200 || res.status === 201)
            return { statusCode: res.status, data: (data && data != "") ? data : "success" }
        else
            return { statusCode: res.status, error: data.message }
    }
    catch (err) {
        return { statusCode: 500, error: `error in POST Request (${path}) :- ${err}` }
    }
}

// update/patch
export const updateRequest = async (path: string, body: any, jwt = "", method = "PATCH", isJson = true) => {
    try {
        const url = settings.env.backendHost + path
        const params: any = (isJson) ?
            {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": 'Bearer ' + jwt,
                },
                body: JSON.stringify(body),
            }
            :
            {
                method,
                headers: {
                    "Authorization": 'Bearer ' + jwt,
                },
                body
            }

        const res = await fetch(url, params)

        if (res.status === 200 || res.status === 201) {
            try {
                const data = await res.json()
                return { statusCode: res.status, data: (data && data != "") ? data : "success" }
            }
            catch (notJson) {
                return { statusCode: res.status, data: "Success" }
            }
        }
        else {
            const data = await res.json()
            return { statusCode: res.status, error: data.message }
        }
    }
    catch (err) {
        return { statusCode: 500, error: `error in ${method} Request (${path}) :- ${err}` }
    }
}
// delete
export const deleteRequest = async (path: string, jwt = "") => {
    try {
        const url = settings.env.backendHost + path
        const params = {
            method: 'DELETE',
            headers: {
                "Authorization": 'Bearer ' + jwt,
            }
        }

        const res = await fetch(url, params)

        if (res.status === 200 || res.status === 201)
            return { statusCode: res.status, data: "success" }
        else
            return { statusCode: res.status, error: "error while deleting" }
    }
    catch (err) {
        return { statusCode: 500, error: `error in DELETE Request (${path}) :- ${err}` }
    }
}