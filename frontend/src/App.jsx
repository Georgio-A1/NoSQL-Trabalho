import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Carousel from "./components/Carousel";
import Categories from "./components/Categories";
import Footer from "./components/Footer";
import BookDetail from "./components/BookDetail";
import LoginPage from "./components/LoginPage";
import PerfilPage from "./components/PerfilPage";
import Carrinho from "./components/Carrinho";
import BooksPage from "./components/BooksPage"
import FinalizarCompra from './components/FinalizarCompra';
import PrivateRoute from "./components/PrivateRoute";
import "./style.css";

function App() {
  return (
    <Router>
      <div>
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<><Carousel /><Categories /></>} />
            <Route path="/livro/:id" element={<BookDetail />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/livros" element={<BooksPage />} />
            <Route path="/finalizar-compra" element={<FinalizarCompra />} />

            <Route
              path="/perfil"
              element={<PrivateRoute element={<PerfilPage />} />}
            />
            <Route path="/carrinho" element={<PrivateRoute element={<Carrinho />} />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
