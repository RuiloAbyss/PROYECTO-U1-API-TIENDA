const { randomUUID } = require('node:crypto')
const bcrypt = require('bcryptjs');
const { db } = require("../firebase");

const usersCollection = db.collection("users");

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

async function createUser({email, password, name, address}) {
    const exiting = await findByEmail(email);
    if(exiting) return null;
    const hashedPass = await bcrypt.hashSync(password, 10); //await hace que la función espere a complir la sentencia que engloba
    const user = {
        id: randomUUID(),
        email:email,
        password:hashedPass,
        name:name,
        role:'user',
        address:address
    };
    await usersCollection.doc(user.id).set(user);
    return{ id:user.id, email: user.email, name:user.name};
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
