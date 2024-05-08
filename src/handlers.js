const { nanoid } = require('nanoid');
const books = require('./books');

const addBookHandler = (request, h) => {
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;

  // Lakukan pengecekan properti
  if (!name) {
    return h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. Mohon isi nama buku',
    }).code(400);
  }

  if (readPage > pageCount) {
    return h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
    }).code(400);
  }

  const id = nanoid(16);
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;
  const finished = pageCount === readPage;

  const newBook = {
    id,
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    finished,
    reading,
    insertedAt,
    updatedAt,
  };

  books.push(newBook);

  // Cek apakah buku berhasil disimpan di array books
  const success = books.filter((book) => book.id === id).length > 0;

  if (success) {
    return h.response({
      status: 'success',
      message: 'Buku berhasil ditambahkan',
      data: {
        bookId: id,
      },
    }).code(201);
  }

  return h.response({
    status: 'fail',
    message: 'Buku gagal ditambahkan. Terjadi kesalahan pada server',
  }).code(500);
};

const getAllBooksHandler = (request, h) => {
  const { name, reading, finished } = request.query;
  let bookBuffer = books;

  // Filter berdasarkan kecocokan dengan nama (case insensitive)
  if (name) {
    bookBuffer = bookBuffer.filter((book) => book.name.toLowerCase().includes(name.toLowerCase()));
  }

  /**
   * Filter berdasarkan status keaktifan baca (0 = false; 1 = true)
   * Menggunakan 'reading === 0' dan 'reading === 1' agar terhindar dari falsy
  */
  if (reading === '0') {
    bookBuffer = bookBuffer.filter((book) => !book.reading);
  } else if (reading === '1') {
    bookBuffer = bookBuffer.filter((book) => book.reading);
  }

  /**
   * Filter berdasarkan progress keselesaian baca (0 = false; 1 = true)
   * Menggunakan 'finished === 0' dan 'finished === 1' agar terhindar dari falsy
  */
  if (finished === '0') {
    bookBuffer = bookBuffer.filter((book) => !book.finished);
  } else if (finished === '1') {
    bookBuffer = bookBuffer.filter((book) => book.finished);
  }

  // Return hasil setelah filter maupun tidak di-filter
  return h.response({
    status: 'success',
    data: {
      books: bookBuffer.map((book) => ({
        id: book.id,
        name: book.name,
        publisher: book.publisher,
      })),
    },
  }).code(200);
};

const getBookByIdHandler = (request, h) => {
  const { bookId } = request.params;

  const targetBook = books.filter((book) => book.id === bookId)[0];

  if (targetBook) {
    return {
      status: 'success',
      data: {
        book: targetBook,
      },
    };
  }

  return h.response({
    status: 'fail',
    message: 'Buku tidak ditemukan',
  }).code(404);
};

const editBookByIdHandler = (request, h) => {
  const { bookId } = request.params;
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;

  // Lakukan pengecekan properti
  if (!name) {
    return h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Mohon isi nama buku',
    }).code(400);
  }

  if (readPage > pageCount) {
    return h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
    })
      .code(400);
  }

  const updatedAt = new Date().toISOString();
  const finished = readPage === pageCount;
  const searchedIndex = books.findIndex((book) => book.id === bookId);

  if (searchedIndex !== -1) {
    books[searchedIndex] = {
      ...books[searchedIndex],
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      finished,
      reading,
      updatedAt,
    };

    return h.response({
      status: 'success',
      message: 'Buku berhasil diperbarui',
    }).code(200);
  }

  return h.response({
    status: 'fail',
    message: 'Gagal memperbarui buku. Id tidak ditemukan',
  }).code(404);
};

const deleteBookByIdHandler = (request, h) => {
  const { bookId } = request.params;

  const searchedIndex = books.findIndex((book) => book.id === bookId);

  if (searchedIndex !== -1) {
    books.splice(searchedIndex, 1);
    return h.response({
      status: 'success',
      message: 'Buku berhasil dihapus',
    }).code(200);
  }

  return h.response({
    status: 'fail',
    message: 'Buku gagal dihapus. Id tidak ditemukan',
  }).code(404);
};

module.exports = {
  addBookHandler,
  getAllBooksHandler,
  getBookByIdHandler,
  editBookByIdHandler,
  deleteBookByIdHandler,
};
