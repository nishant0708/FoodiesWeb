import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import Navbar from "../components/Navbar";
import Loader from "../components/Loader/Loader";
import Footer from "../components/Footer";
import { ThemeContext } from '../themeContext';

const StarRating = ({ rating, onRatingChange }) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          type="button"
          key={star}
          className={`star ${star <= (hoverRating || rating) ? "on" : "off"}`}
          onClick={() => onRatingChange(star)}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
        >
          &#9733;
        </button>
      ))}
    </div>
  );
};

function MenuPage() {
  const { _id } = useParams();
  const [breakfast, setBreakfast] = useState();
  const [lunch, setLunch] = useState();
  const [dinner, setDinner] = useState();
  const [selectedDish, setSelectedDish] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const { theme, toggleTheme } = useContext(ThemeContext);

  const getBreakfast = async () => {
    try {
      setLoading(true);
      const getBreakfast = await fetch(
        `${process.env.REACT_APP_BASE_URL}/${_id}/breakfast`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const res = await getBreakfast.json();
      setBreakfast(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getLunch = async () => {
    try {
      setLoading(true);
      const getLunch = await fetch(
        `${process.env.REACT_APP_BASE_URL}/${_id}/lunch`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const res = await getLunch.json();
      setLunch(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getDinner = async () => {
    try {
      setLoading(true);
      const getDinner = await fetch(
        `${process.env.REACT_APP_BASE_URL}/${_id}/dinner`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const res = await getDinner.json();
      setDinner(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getBreakfast();
    getLunch();
    getDinner();
  }, []);

  useEffect(() => {
    const handleSearch = async () => {
      if (searchTerm.trim() === "") {
        setSearchResults([]);
        return;
      }

      try {
        setLoading(true);
        const [breakfastRes, lunchRes, dinnerRes] = await Promise.all([
          fetch(`${process.env.REACT_APP_BASE_URL}/${_id}/breakfast`).then(res => res.json()),
          fetch(`${process.env.REACT_APP_BASE_URL}/${_id}/lunch`).then(res => res.json()),
          fetch(`${process.env.REACT_APP_BASE_URL}/${_id}/dinner`).then(res => res.json())
        ]);

        const allDishes = [...breakfastRes.data, ...lunchRes.data, ...dinnerRes.data];
        const filteredDishes = allDishes.filter(dish =>
          dish.dish.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setSearchResults(filteredDishes);
      } catch (error) {
        console.error("Error during search: ", error);
      } finally {
        setLoading(false);
      }
    };

    handleSearch();
  }, [searchTerm, _id]);

  const handleDishClick = async (dishId) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_SPOONACULAR_API_URL}/recipes/${dishId}/information?apiKey=${process.env.REACT_APP_API_KEY}`
      );
      const recipeUrl = response.data.spoonacularSourceUrl;
      window.open(recipeUrl, "_blank");
    } catch (error) {
      console.error("Error fetching recipe information: ", error);
    }
  };

  const handleFeedbackSubmit = async () => {
    if (feedback.trim() === '' && rating === 0) {
      toast.error("Please provide your feedback and rating before submitting.");
    } else {
      setFeedback('');
      toast.success('Feedback Submitted!');
    }
  }

  const renderMenuItems = () => {
    let items = [];
    switch (selectedCategory) {
      case 'breakfast':
        items = breakfast;
        break;
      case 'lunch':
        items = lunch;
        break;
      case 'dinner':
        items = dinner;
        break;
      default:
        items = [];
    }
    if (items.length === 0) {
      return <p className="absolute w-full text-xl text-red-700 text-center dark:text-red-400">No {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Available Now</p>;
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_BASE_URL}/feedback`,
          {
            canteenId: _id,
            feedback: feedback,
            rating: rating,
            studentId: localStorage.getItem('token')
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        setFeedback('');
        setRating(0);
        toast.success('Feedback Submitted!');
      } catch (error) {
        console.error("Error submitting feedback: ", error);
        toast.error("Failed to submit feedback. Please try again.");
      }
    }
  };

  const renderSearchResults = () => {
    if (searchResults.length === 0) {
      return <p className="text-xl text-red-700 text-center dark:text-red-400">No Results Found</p>;
    }
    return searchResults.map((dish) => (
      <FoodCard key={dish._id} dish={dish} onClick={() => handleDishClick(dish.dishId)} />
    ));
  };

  return (
    <div className="text-purple-800 min-h-screen pt-5">
      <Navbar />
      <div className="container px-8 mx-auto p-4 mt-20 min-h-screen bg-transparent dark:bg-slate-200">
        <div className="flex justify-center space-x-4 mb-8">
          {['breakfast', 'lunch', 'dinner'].map((category) => (
            <button
              key={category}
              className={`px-4 py-2 rounded-lg ${selectedCategory === category ? 'bg-green-300' : 'bg-gray-300'} focus:outline-none`}
              onClick={() => setSelectedCategory(category)}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
        <div className="mb-8 flex justify-center">
          <input
            type="text"
            className="w-2/3 p-2 border border-purple-300 rounded"
            placeholder="Search for a dish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {searchTerm ? (
          <div className="grid grid-cols-1 relative md:grid-cols-2 lg:grid-cols-3 gap-4 justify-center">
            {loading ? <Loader /> : renderSearchResults()}
          </div>
        ) : (
          <>
            <h1 className="text-4xl font-bold mb-8 text-white text-center capitalize dark:text-black">{selectedCategory}</h1>
            {loading ? (
              <Loader />
            ) : (
              <div className="grid grid-cols-1 relative md:grid-cols-2 lg:grid-cols-3 gap-4 justify-center">
                {renderMenuItems()}
              </div>
            )}
          </>
        )}
      <div className="container mx-auto p-4">
        <h1 className="text-4xl font-bold mb-8 text-white">Today's Menu</h1>
        {
          loading ? (
            <Loader />
          ) : (
            <>
              <div className="flex flex-col gap-4 p-5 md:flex-row justify-center">
                {breakfast && (
                  <div className="w-2/3 rounded-lg shadow-md border-2 border-red-300 mt-5">
                    <div className="text-center bg-red-300 text-black py-3 font-xl relative">
                      <img
                        src="https://cdn-icons-png.flaticon.com/128/5025/5025429.png"
                        alt="Breakfast Icon"
                        className="absolute top-0 left-4 h-16 w-16 -mt-8 -ml-8"
                      />
                      Breakfast
                    </div>
                    <div className="p-4">
                      <ul>
                        {breakfast.data.map((dish) => (
                          <li
                            key={dish._id}
                            onClick={() => handleDishClick(dish.dishId)}
                            className={`cursor-pointer hover:bg-gradient-to-r from-green-300 to-green-500 transition-transform duration-300 ease-in-out transform hover:-translate-y-1 px-5 py-2 ${theme === 'dark' ? 'text-white' : 'text-red-600'} hover:text-black mt-2 `}
                          >
                            • {dish.dish}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                {lunch && (
                  <div className="w-2/3 rounded-lg shadow-md border-green-300 border-2 mt-5">
                    <div className="text-center bg-green-300 text-black py-3 font-xl relative">
                      <img
                        src="https://cdn-icons-png.flaticon.com/128/2082/2082045.png"
                        alt="Lunch Icon"
                        className="absolute top-0 left-4 h-16 w-16 -mt-8 -ml-8"
                      />
                      Lunch
                    </div>
                    <div>
                      <ul>
                        {lunch.data.map((dish) => (
                          <li
                            key={dish._id}
                            onClick={() => handleDishClick(dish.dishId)}
                            className={`hover:bg-gradient-to-r from-green-300 to-green-500 transition-transform duration-300 ease-in-out transform hover:-translate-y-1 px-5 py-2 ${theme === 'dark' ? 'text-white' : 'text-green-600'} hover:text-black mt-2 `}
                          >
                            • {dish.dish}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                {dinner && (
                  <div className="w-2/3 rounded-lg shadow-md border-yellow-300 border-2 mt-5">
                    <div className="text-center bg-yellow-300 text-black py-3 font-xl relative">
                      <img
                        src="https://cdn-icons-png.flaticon.com/128/3321/3321601.png"
                        alt="Dinner Icon"
                        className="absolute top-0 left-4 h-16 w-16 -mt-8 -ml-8"
                      />
                      Dinner
                    </div>
                    <div>
                      <ul>
                        {dinner.data.map((dish) => (
                          <li
                            key={dish._id}
                            onClick={() => handleDishClick(dish.dishId)}
                            className={`hover:bg-gradient-to-r from-yellow-300 to-yellow-500 transition-transform duration-300 ease-in-out transform hover:-translate-y-1 px-5 py-2 ${theme === 'dark' ? 'text-white' : 'text-yellow-600'} hover:text-black mt-2 `}
                          >
                            • {dish.dish}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-8 text-purple-800">
                <h2 className="text-2xl font-bold mb-4 text-white dark:text-slate-900">Meal Feedback</h2>
                <textarea
                  className="w-full h-32 p-4 border border-purple-300 rounded mb-4"
                  placeholder="Enter your feedback here..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                ></textarea>
                <div className="mb-4">
                  <StarRating rating={rating} onRatingChange={setRating} />
                </div>
                <button
                  onClick={handleFeedbackSubmit}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                  Submit Feedback
                </button>
              </div>
            </>
          )
        }
      </div>
      <Footer />
    </div>
  );
}

export default MenuPage;
