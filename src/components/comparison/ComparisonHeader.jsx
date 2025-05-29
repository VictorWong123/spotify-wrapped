import React from 'react';

const ComparisonHeader = ({ currentUser, otherUser, compatibilityScore }) => {
    return (
        <div className="comparison-header">
            {otherUser.images?.[0]?.url && (
                <img
                    src={otherUser.images[0].url}
                    alt={otherUser.display_name}
                    className="profile-image-small"
                />
            )}
            <div>
                <h2 className="text-medium">
                    {otherUser.display_name}
                </h2>
                {compatibilityScore !== null ? (
                    <div className="text-small compatibility-score">
                        Compatibility Score: {compatibilityScore}%
                    </div>
                ) : (
                    <div className="text-small compatibility-score">
                        Not enough data to calculate compatibility score
                    </div>
                )}
            </div>
        </div>
    );
};

export default ComparisonHeader; 