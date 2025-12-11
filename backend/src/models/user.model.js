const { randomUUID } = require('node:crypto')
const bcrypt = require('bcryptjs');

//Firebase
const { db } = require("../firebase");
const usersCollection = db.collection("users");

// Faturapi
const Facturapi = require('facturapi').default;
const facturapi = new Facturapi(process.env.FACTURAPI_KEY); //Esto debe trasnferirse a un .env al terminar las pruebas

async function getAllUsers() {
    const users = await usersCollection.get();
    return users.docs.map((doc) => {
        const { password, ...userWithoutPass } = doc.data();
        return { id: doc.id, ...userWithoutPass };
    });
}

async function findById(id) {
    const user = await usersCollection.doc(id).get();
    if (!user.exists) return null;
    return { id: user.id, ...user.data() };
}

async function findByEmail(email) {
    const user = await usersCollection.where('email', '==', email).get();
    if (user.empty) return null;
    const doc = user.docs[0];
    return { id: doc.id, ...doc.data() };
}

async function findByTaxId(tax_id) {
    const user = await usersCollection.where('tax_id', '==', tax_id).get();
    if (user.empty) return null;
    const doc = user.docs[0];
    return { id: doc.id, ...doc.data() };
}

//Facturapi - Crear cliente
async function createClient(name, tax_id, email, address, tax_system = '601') {
    try {
        console.log("Creando cliente en Facturapi...");
        const addressInfo = typeof address === 'object' && address.zip ?
            { zip: address.zip, street: address.street } :
            { zip: '63446', street: address };

        const customer = await facturapi.customers.create({
            legal_name: name,
            tax_id: tax_id,
            email: email,
            address: addressInfo,
            tax_system: tax_system,
        });
        console.log('Cliente creado:', customer);
        return customer.id;
    } catch (error) {
        console.error('Error al crear el cliente en Facturapi:', error.message);
        return null;
    }
}

async function createUser({ email, tax_id, password, name, address }) {
    if (!tax_id) return { error: "El RFC (tax_id) es requerido." };

    const existingTaxId = await findByTaxId(tax_id);
    if (existingTaxId) return { error: "El RFC (tax_id) ya está registrado." };

    const exiting = await findByEmail(email);
    if (exiting) return null;

    const hashedPass = await bcrypt.hashSync(password, 10); //await hace que la función espere a complir la sentencia que engloba
    const user = {
        id: randomUUID(),
        id_client: await createClient(name, tax_id, email, address), //dar de alta y obtener ID de facturapi para cliente
        tax_id: tax_id,
        email: email,
        password: hashedPass,
        name: name,
        role: 'user',
        address: address,
        isActive: true
    };

    await usersCollection.doc(user.id).set(user);
    return { id: user.id, id_client: user.id_client, email: user.email, tax_id: tax_id, name: user.name, isActive: user.isActive };
}

async function editUser(id, { email, password, name, address, tax_id, isActive }) {
    const doc = await usersCollection.doc(id).get();
    if (!doc.exists) return null;

    const userData = doc.data();

    // Actualizar cliente en Facturapi si hay cambios relevantes
    if (userData.id_client && (name || email || address || tax_id)) {
        try {
            console.log(`Actualizando cliente ${userData.id_client} en Facturapi...`);
            const addressInfo = typeof address === 'object' && address.zip ?
                { zip: address.zip, street: address.street } :
                { street: address };

            await facturapi.customers.update(userData.id_client, {
                legal_name: name,
                tax_id: tax_id,
                email: email,
                address: address ? addressInfo : undefined
            });
            console.log("Cliente en Facturapi actualizado.");
        } catch (error) {
            console.error('Error al actualizar el cliente en Facturapi:', error.message);
            // Considera cómo manejar este error. Por ahora, solo lo registramos.
        }
    }

    const updated = {
        email: email ?? doc.data().email,
        password: password ? await bcrypt.hashSync(password, 10) : doc.data().password,
        name: name ?? doc.data().name,
        address: address ?? doc.data().address,
        tax_id: tax_id ?? doc.data().tax_id,
        isActive: isActive !== undefined ? isActive : doc.data().isActive
    };
    await usersCollection.doc(id).update(updated);
    return { id, ...updated };
}

async function deleteUser(id) {
    const doc = await usersCollection.doc(id).get();
    if (!doc.exists) return null;

    const userData = doc.data();
    if (userData.id_client) {
        try {
            console.log(`Eliminando cliente ${userData.id_client} de Facturapi...`);
            await facturapi.customers.del(userData.id_client);
            console.log("Cliente en Facturapi eliminado.");
        } catch (error) {
            console.error('Error al eliminar el cliente en Facturapi:', error.message);
        }
    }

    await usersCollection.doc(id).delete();
    return true;
}

module.exports = { getAllUsers, findById, findByEmail, findByTaxId, createUser, editUser, deleteUser };
