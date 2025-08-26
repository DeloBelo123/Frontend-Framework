"use client"
import { fetching } from "../Dispatched/useFetch"
import useFetch from "../Dispatched/useFetch"
interface PicProps extends Partial<fetching> {
    query?:string
    apiKey?:string
}
export default function usePic({url,query,apiKey}:PicProps){
    const head = apiKey ? { Authorization : apiKey} : undefined
    const picture = useFetch({
        url: url || `https://api.unsplash.com/search/photos?query=${query}`,
        header: head
    })
    return picture
}