const { randomUUID } = require('node:crypto')
const bcrypt = require('bcryptjs');

//Firebase
const { db } = require("../firebase");
const usersCollection = db.collection("users");

// Faturapi
const Facturapi = require('facturapi').default;
const facturapi = new Facturapi('sk_test_WAeBQ0ZGo9n4D1pZeOMonjmHAem7JMpPvOY8RgEzrk'); //sk_user_anXyMVwxYB2p6dZP6L4PPAKT5qpOGRPqzDEQ8gKjAv

async function getAllUsers(){
    const users = await usersCollection.get();
    return users.docs.map((doc) => {
        const { password, ...userWithoutPass } = doc.data();
        return { id: doc.id, ...userWithoutPass };
    });
}

async function findById(id){
    const user = await usersCollection.doc(id).get();
    if(!user.exists) return null;
    return { id: user.id, ...user.data() };
}

async function findByEmail(email){
    const user = await usersCollection.where('email', '==', email).get();
    if(user.empty) return null;
    const doc = user.docs[0];
    return { id: doc.id, ...doc.data() };
}

//Facturapi - Crear cliente
async function createClient(name, tax_id, email, address) {
    console.log("tax_id: ",tax_id);
    try {
        console.log("Creando cliente en Facturapi...");
        const customer = await facturapi.customers.create({
            legal_name: name,
            tax_id: tax_id,
            email: email,
            address: {
                zip: '63446',
                street: address,
            },
            tax_system: '601',
        });
        console.log('Cliente creado:', customer);
        return customer.id
        } catch (error) {
        console.error('Error al crear el cliente:', error);
    }
}
       
async function createUser({email, tax_id, password, name, address}) {
    const exiting = await findByEmail(email);
    if(exiting) return null;

    const hashedPass = await bcrypt.hashSync(password, 10); //await hace que la función espere a complir la sentencia que engloba
    const user = {
        id: randomUUID(),
        id_client: await createClient(name, tax_id, email, address), //dar de alta y obtener ID de facturapi para cliente
        tax_id: tax_id,
        email:email,
        password:hashedPass,
        name:name,
        role:'user',
        address:address
    };

    await usersCollection.doc(user.id).set(user);
    return{ id:user.id, id_client:user.id_client, email: user.email, tax_id:tax_id, name:user.name};
}

async function editUser(id, {email, password, name, address}){
    const doc = await usersCollection.doc(id).get();
    if(!doc.exists) return null;
    const updated = {
        email: email ?? doc.data().email,
        password: password ? await bcrypt.hashSync(password,10) : doc.data().password,
        name: name ?? doc.data().name,
        address: address ?? doc.data().address
    };
    await usersCollection.doc(id).update(updated);
    return { id, ...updated };
} 

async function deleteUser(id){
    const doc = await usersCollection.doc(id).get();
    if(!doc.exists) return null;
    await usersCollection.doc(id).delete();
    return true;
}

module.exports = { getAllUsers, findById, findByEmail, createUser, editUser, deleteUser };
