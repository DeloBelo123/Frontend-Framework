import { UUID } from "crypto"
import { SupabaseTable } from "./supabase"

export interface MailTable {
    unique_mail_id:string
    inhaber_id:string
    mail_body:string
    mail_summary:string
    mail_category:string
}
export const MailTabelle = new SupabaseTable<MailTable>("mails")

export interface UserTable {
    user_id:UUID
    mail_inhaber_id:UUID
    user_mail:string 
    user_context:string
}
export const UserTabelle = new SupabaseTable<UserTable>("users")



