import { useState, useEffect } from 'react';
import './HeroCarousel.css';

const HeroCarousel = () => {
  const images = [
    {
      id: 1,
      url: 'https://d2z2mkwk6fkehh.cloudfront.net/f2me/blog/How%20to%20Ship%20a%20Package%20Internationally/bd8aa5a77f9f8646465d94e24e6fe533.jpg',
      alt: 'Shipping Boxes',
      title: 'Enjoy Free Shipping Within 3-5 Business Days!',
    },
    {
      id: 2,
      url: 'https://wallpapers.com/images/hd/row-of-bookshelf-from-library-wzcir10772tcuqps.jpg',
      alt: 'Beautiful library with books',
      title: 'Discover Your Next Favorite Book',
    },
    {
      id: 3,
      url: 'https://img.freepik.com/free-photo/black-friday-elements-assortment_23-2149074076.jpg?semt=ais_hybrid&w=740',
      alt: 'Discount Ad',
      title: 'Buy over $200 in one purchase and receive $10 off!',
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="hero-carousel">
      <div className="carousel-container">
        {images.map((image, index) => (
          <div 
            key={image.id}
            className={`carousel-slide ${index === currentIndex ? 'active' : ''}`}
          >
            <img 
              src={image.url} 
              alt={image.alt}
              className="carousel-image"
            />
            <div className="carousel-overlay">
              <div className="carousel-content">
                <h3>{image.title}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="carousel-dots">
        {images.map((_, index) => (
          <button
            key={index}
            className={`dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;