import React from 'react';
import ListeningTime from './ListeningTime';

const UserProfileCard = ({ currentUser, token, topTracks }) => {
    return (
        <div className="card user-profile-card">
            <div className="user-profile-content">
                <div className="user-profile-left">
                    {currentUser?.images?.[0]?.url && (
                        <img
                            src={currentUser.images[0].url}
                            alt={currentUser.display_name}
                            className="profile-image"
                        />
                    )}
                    <h1 className="text-large">{currentUser?.display_name}</h1>
                </div>
                <ListeningTime token={token} topTracks={topTracks} />
            </div>
        </div>
    );
};

export default UserProfileCard; 