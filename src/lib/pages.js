import clientPromise from "./mongodb";

export async function getAllPages() {
    const client = await clientPromise
    const db = client.db("next_local_db");

    return db.collection("pages").find({}).toArray();
}

export async function getPageByHandle(handle) {
    const client = await clientPromise;
    const db = client.db("next_local_db");

    return db.collection("pages").findOne({handle});
}