import { useState, useContext, useEffect } from 'react';
import AuthContext from '../../../contexts/AuthContext.jsx';
import { updateUserDetails } from '../../../services/api.js';
import CreditCardPopup from '../../../components/creditCardPopup/CreditCardPopup.jsx';
import './UserDetailsPage.css';

function UserDetailsPage() {
    const [isEditMode, setIsEditMode] = useState(false);
    const [showCreditCardPopup, setShowCreditCardPopup] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const { currentUser, setCurrentUser } = useContext(AuthContext);

    const [editedUser, setEditedUser] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        city: '',
        street: '',
        house_number: ''
    });

    useEffect(() => {
        if (currentUser) {
            setEditedUser({
                first_name: currentUser.first_name || '',
                last_name: currentUser.last_name || '',
                email: currentUser.email || '',
                phone: currentUser.phone || '',
                city: currentUser.city || '',
                street: currentUser.street || '',
                house_number: currentUser.house_number || ''
            });
        }
    }, [currentUser]);

    // פונקציה לזיהוי השינויים בפרטי המשתמש
    const getChangedUserFields = () => {
        const changes = {};
        const fieldsToCheck = ['first_name', 'last_name', 'email', 'phone', 'city', 'street', 'house_number'];
        
        fieldsToCheck.forEach(field => {
            const originalValue = currentUser[field] || '';
            const editedValue = editedUser[field] || '';
            
            if (originalValue !== editedValue) {
                changes[field] = editedValue;
            }
        });
        
        return changes;
    };

        // פונקציה לעדכון פרטי משתמש - שולח רק שדות שהשתנו
    const handleSaveUserDetails = async () => {
        try {
            setLoading(true);
            setError('');
            
            const changedFields = getChangedUserFields();
            
            // אם אין שינויים, אל תשלח בקשה
            if (Object.keys(changedFields).length === 0) {
                setSuccessMessage('No changes have been made.');
                setIsEditMode(false);
                setTimeout(() => setSuccessMessage(''), 3000);
                return;
            }
            
            await updateUserDetails(currentUser.id, changedFields);

            // עדכון המשתמש 
            setCurrentUser({ ...currentUser, ...changedFields });
            setSuccessMessage(`${Object.keys(changedFields).length} fields updated successfully.`);
            setIsEditMode(false);
            
            // הסתרת הודעת הצלחה אחרי 3 שניות
            setTimeout(() => setSuccessMessage(''), 3000);
            
        } catch (err) {
            setError(err.message || 'Failed to update user details');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelEdit = () => {
        setIsEditMode(false);
        if (currentUser) {
            setEditedUser({
                first_name: currentUser.first_name || '',
                last_name: currentUser.last_name || '',
                email: currentUser.email || '',
                phone: currentUser.phone || '',
                city: currentUser.city || '',
                street: currentUser.street || '',
                house_number: currentUser.house_number || ''
            });
        }
    };

    const handleUserInputChange = (field, value) => {
        setEditedUser(prev => ({ ...prev, [field]: value }));
    };

  return (
    <div className="user-details-container">
        <h1>User Details</h1>
        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        {!isEditMode ? (
            <button
                onClick={() => setIsEditMode(true)}
                className="btn btn-success"
            >
                עריכה
            </button>
        ) : (
            <>
                <button
                    onClick={handleSaveUserDetails}
                    disabled={loading}
                    className="btn btn-success"
                >
                    {loading ? 'Saving...' : 'save'}
                </button>
                <button
                    onClick={handleCancelEdit}
                    className="btn btn-secondary"
                >
                    cancel
                </button>
            </>
        )}


        <div className="user-details">
            {!isEditMode ? (
            <div>
                <p><strong>First Name:</strong> {currentUser.first_name}</p>
                <p><strong>Last Name:</strong> {currentUser.last_name}</p>
                <p><strong>Email:</strong> {currentUser.email}</p>
                <p><strong>Phone:</strong> {currentUser.phone}</p>
                <p><strong>Address:</strong></p>
                <p><strong>City:</strong>{currentUser.city}</p> 
                <p><strong>Street:</strong> {currentUser.street}</p>
                <p><strong>House Number:</strong> {currentUser.house_number}</p>

                <button onClick={() => setShowCreditCardPopup(true)}>Manage Credit Card</button>
                
                {showCreditCardPopup && <CreditCardPopup userId={currentUser.id} setShowCreditCardPopup={setShowCreditCardPopup}/>}
            </div>
            ) : (
            <form className="edit-user-form">
                <div className="form-group">
                    <label htmlFor="first_name">First Name</label>
                    <input id='first_name' type="text" value={editedUser.first_name} onChange={(e) => handleUserInputChange('first_name', e.target.value)}/>
                </div>
                <div className="form-group">
                    <label htmlFor="last_name">Last Name</label>
                    <input id="last_name" type="text" value={editedUser.last_name} onChange={(e) => handleUserInputChange('last_name', e.target.value)}/>
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input id="email" type="email" value={editedUser.email} onChange={(e) => handleUserInputChange('email', e.target.value)}/>
                </div>
                <div className="form-group">
                    <label htmlFor="phone">Phone</label>
                    <input id="phone" type="tel" value={editedUser.phone} onChange={(e) => handleUserInputChange('phone', e.target.value)}/>
                </div>
                <div className="form-group">
                    <label htmlFor="city">City</label>
                    <input id="city" type="text" value={editedUser.city} onChange={(e) => handleUserInputChange('city', e.target.value)}/>
                </div>
                <div className="form-group">
                    <label htmlFor="street">Street</label>
                    <input id="street" type="text" value={editedUser.street} onChange={(e) => handleUserInputChange('street', e.target.value)}/>
                </div>
                <div className="form-group">
                    <label htmlFor="house_number">House Number</label>
                    <input id="house_number" type="text" value={editedUser.house_number} onChange={(e) => handleUserInputChange('house_number', e.target.value)}/>
                </div>
            </form>
            )}
        </div>
      
    </div>
  );
}

export default UserDetailsPage;