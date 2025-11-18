import { suggestLanguages } from "@/ai/flows/suggest-languages";
import {NextResponse} from "next/server";

export async function POST(req: Request) {
    try {
        const { installedApps } = await req.json();
        const result = await suggestLanguages({ installedApps });
        return NextResponse.json(result);
    } catch (error: any) {
        console.error("Failed to get language suggestions:", error);
        return NextResponse.json({ message: "Could not load suggestions. Please try again later." }, { status: 500 });
    }
}
