import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getBookById } from '../../../services/api';
import './BookDetailsPage.css';

function BookDetailsPage() {
  const { bookId } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchBook() {
      try {
        setLoading(true);
        const response = await getBookById(bookId);
        setBook(response.data);
      } catch (err) {
        setError('Error loading book details');
      } finally {
        setLoading(false);
      }
    }
    fetchBook();
  }, [bookId]);

  if (loading) return <p>Loading book details...</p>;
  if (error) return <p>{error}</p>;
  if (!book) return <p>Book not found</p>;

  return (
    <div className="book-details">
      <img src={book.image_url} alt={book.title} className="book-details-image" />
      <div className="book-details-info">
        <h2>{book.title}</h2>
        <p><strong>Author:</strong> {book.author}</p>
        <p><strong>Price:</strong> ${book.price}</p>
        <p>{book.description}</p>
      </div>
    </div>
  );
}

export default BookDetailsPage;
