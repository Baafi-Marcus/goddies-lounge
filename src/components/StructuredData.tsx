import React from 'react';

interface StructuredDataProps {
    data: Record<string, any>;
}

const StructuredData: React.FC<StructuredDataProps> = ({ data }) => {
    return (
        <script type="application/ld+json">
            {JSON.stringify(data)}
        </script>
    );
};

export default StructuredData;
