import React from 'react';

const UserScreen = ({ onLogout }) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            fontFamily: 'sans-serif'
        }}>
            <h1>Hola eres usuario</h1>
            <button
                onClick={onLogout}
                style={{
                    marginTop: '20px',
                    padding: '10px 20px',
                    fontSize: '16px',
                    cursor: 'pointer',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px'
                }}
            >
                Cerrar Sesión
            </button>
        </div>
    );
};

export default UserScreen;
