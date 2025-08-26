import { createClient } from "@supabase/supabase-js";
import axios from "axios"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey) // bekommt die daten für auth vom browser-cookies storage

// Supabase Class für vereinfachung der Nutzung
export class SupabaseTable<T> {
    public tableName:string
    public structure?:T 
    constructor(tableName:string){
        this.tableName = tableName
    }
    /**
     * @param rows - die neuen Zeilen die du in die Tabelle einfügen möchtest, als Array von Objekten, wo jedes Objekt eine Zeile ist
     * @returns nichst, fügt eifach die neuen Zeilen in die Tabelle ein
     */
    async insert({rows}:{rows:Array<Partial<T>>}){
        const { data:insertedData, error } = await supabase
            .from(this.tableName)
            .insert(rows)
        if (error) {
            throw new Error(`Error inserting data into ${this.tableName}: ${error.message}`);
        }
        return insertedData;
    }
    /**
     * @param columns - die spalten die du abfragen möchtest, standardmäßig ist es "*", also alle spalten,
     * @param filters - die filter die du anwenden möchtest was ausgewählt werden soll, standardmäßig ist es ein leeres Array, also keine Filter
     * @returns returned ein array von Objekte, wo jedes Objekt eine Zeile der Tabelle ist, die den optionalen Filtern entspricht, wo die Keys die spaltennamen sind und die Values die Werte der Zeile
     */
    async select({columns , where = []}:{columns:Array<keyof T | "*">, where?:Array<{column:keyof T,is:string | number | boolean | Date | null | undefined}>}){
        let columnString = columns.join(",")
        let query = supabase.from(this.tableName).select(columnString)
        for ( const {column,is} of where){
            query = query.eq(column as string,is)
        }
        const { data, error } = await query
        if (error) {
            console.error("Error selecting data:", error);
            throw new Error(`Error selecting data from ${this.tableName}: ${error.message}`);
        }
        return data;
    }
    /**
     * @param updated_cols - die spalten die du aktualisieren möchtest, als Objekt wo der key der Spaltenname ist und der value der neue Wert
     * @param filters - die Filter die genau sagen welche Zeile sich aktualisieren soll, sonst wird jede Zeile aktualisiert!!!
     * @returns die geupdateten Zeilen, also die Zeilen die du aktualisiert hast
     */
    async update({where = [],update}:{ where:Array<{column:keyof T,is:string | number | boolean | Date | null | undefined}>, update:Partial<T> }){
        let query = supabase.from(this.tableName).update(update)
        for ( const {column,is} of where){
            query = query.eq(column as string,is)
        }
        const { data, error } = await query
        if (error) {
            throw new Error(`Error updating data in ${this.tableName}: ${error.message}`);
        }
        return data;
    }
    /**
     * @param filters - die Filter die genau sagen welche Zeile gelöscht werden soll, sonst wird jede Zeile gelöscht!!!
     * @returns garnichts, führt einfach nur eine Löschaktion aus
     */
    async delete({where = []}:{ where:Array<{column:keyof T,is:string | number | boolean | Date | null | undefined}> }){
        let query = supabase.from(this.tableName).delete()
        for ( const {column,is} of where){
            query = query.eq(column as string,is)
        }
        const { data, error } = await query
        if (error) {
            throw new Error(`Error deleting data from ${this.tableName}: ${error.message}`);
        }
        return data;
    }
}

//supabase-auth stuff

/**
 * sendet die relevantesten daten der session an ein backend. 
 * die daten sind: provider-token, refresh-token, userobjekt mit id und email (den erst nicht, nur diese 2 sind die wichtigsten)
 * WICHTIG: das ist eine async function, du muss sie awaiten!
 * @param backendURL = das ist die backend url an der du deine session schicken willst
 * @returns backend-response
 */
export async function sendSession<T>({toBackend}:{toBackend:string}){
    const { data, error:sessionError } = await supabase.auth.getSession()
    console.log(`google_access_token:${data.session?.provider_token}`)
    console.log(`google_refresh_token:${data.session?.provider_refresh_token}`)
    console.log(`user_id und mail = id:${data.session?.user.id} + email:${data.session?.user.email}`)
    if (sessionError) throw new Error("fehler beim session Kriegen!")
    if (!data.session) throw new Error("Keine aktive Session - User ist nicht eingeloggt!")
    try{
        const { data:backendData,status } = await axios.post<T>(
            toBackend,
            {
                google_access_token:data.session?.provider_token,
                google_refresh_token:data.session?.provider_refresh_token,
                user:{
                    id:data.session?.user.id,
                    email:data.session?.user.email
                }
            }
        )
        return { data:backendData,status,session:data.session }
    }catch(e){
        console.error(`Error bei 'sendSession' call: ${e}`)
        return { data:null, status:500 }
    }
}





