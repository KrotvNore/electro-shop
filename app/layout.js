// app/layout.js
import "./globals.css";
import { CartProvider } from "../lib/CartContext";
import Header from "../components/Header";

export const metadata = {
  title: "ВАТТ.МАРКЕТ — освещение и электрика",
  description: "Каталог светильников, люстр, кабеля и электрофурнитуры. Оформите заказ — мы свяжемся с вами для подтверждения.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>
        <CartProvider>
          <Header />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
