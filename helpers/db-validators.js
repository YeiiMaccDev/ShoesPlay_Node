const {
    Category,
    Product,
    Role,
    User,
    Gender,
} = require('../models');

const isValidRole = async (role = '') => {
    const existsRole = await Role.findOne({ role });
    if (!existsRole) {
        throw new Error(`El rol ${role} no está registrado en la DB`);
    }
}

const existsEmail = async (email = '') => {
    const exists = await User.findOne({ email });

    if (exists) {
        throw new Error(`El email ${email}, ya está registrado.`);
    }
}


const existsUserById = async (id = '') => {
    const existsUser = await User.findById(id);

    if (!existsUser) {
        throw new Error(`El id ' ${id} ' no está registrado.`);
    }
}


const existsCategoryById = async (id = '') => {
    const existsCategory = await Category.findById(id);

    if (!existsCategory) {
        throw new Error(`El id ' ${id} ' no está registrado.`);
    }
}

const existsGenderById = async (id = '') => {
    const existsGender = await Gender.findById(id);

    if (!existsGender) {
        throw new Error(`El id ' ${id} ' no está registrado.`);
    }
}

const existsProductsInCategoryById = async (id = '') => {
    const existsCategory = await Category.findById(id);

    if (!existsCategory) {
        throw new Error(`El id ' ${id} ' no está registrado.`);
    }


    const products = await Product.find({ category: existsCategory._id, status: true })
        .populate('category', 'name');

    const productsLength = products.length;

    if (productsLength) {
        throw new Error(`La categoría ' ${existsCategory.name} ' contiene ${productsLength} productos registrados.`);
    }
}

const existsProductById = async (id = '') => {
    const existsProduct = await Product.findById(id);

    if (!existsProduct) {
        throw new Error(`El id ' ${id} ' no está registrado.`);
    }
}



/**
 * Validate authorized collections.
 */

const iscollectionsAuthorized = (collection = '', collections = []) => {
    const isIncluded = collections.includes(collection);
    if (!isIncluded) {
        throw new Error(`Colección (${collection}) no está autorizada, Autorizadas: ${collections}`);
    }
    return true;
}

/**
 * Validates if each array position is an object.
 */
const isArrayOfObject = (list = []) => {
    if (!list.every((item) => typeof item === 'object')) {
        throw new Error('Cada item deben ser un objeto.');
    }
    return true;
}


module.exports = {
    isValidRole,
    existsEmail,
    existsCategoryById,
    existsGenderById,
    existsProductsInCategoryById,
    existsProductById,
    existsUserById,
    iscollectionsAuthorized,
    isArrayOfObject
}