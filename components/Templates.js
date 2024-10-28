import React, { useState, useEffect } from 'react';
import CSVUploader from './CSVUploader';

const Templates = () => {
  const [segments, setSegments] = useState([
    { name: 'Greeting', variations: ['Hi, [NAME].', 'Hey, [NAME]!'] },
    { name: 'Message', variations: [
      'Take our quick survey on the Pasadena election:',
      'Share your thoughts on Pasadena\'s election:'
    ]},
    { name: 'Link', variations: [
      '/SE/1/PSD/?p={extern_id}',
      '/SE/1/PSD/?p={extern_id}'
    ]},
    { name: 'Optout', variations: ['STOP to stop', 'Txt STOP to end'] }
  ]);
  const [preview, setPreview] = useState('');
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    updatePreview();
  }, [segments]);

  const addSegment = () => {
    console.log('Add Segment button clicked'); // Debugging line
    const segmentName = prompt('Enter new segment name:');
    if (segmentName) {
      setSegments([...segments, { name: segmentName, variations: [] }]);
    }
  };

  const addVariation = (segmentIndex) => {
    const newVariation = prompt(`Enter new variation for ${segments[segmentIndex].name}:`);
    if (newVariation) {
      const newSegments = [...segments];
      newSegments[segmentIndex].variations.push(newVariation);
      setSegments(newSegments);
    }
  };

  const editVariation = (segmentIndex, variationIndex) => {
    const newVariation = prompt('Edit variation:', segments[segmentIndex].variations[variationIndex]);
    if (newVariation) {
      const newSegments = [...segments];
      newSegments[segmentIndex].variations[variationIndex] = newVariation;
      setSegments(newSegments);
    }
  };

  const deleteVariation = (segmentIndex, variationIndex) => {
    if (confirm('Are you sure you want to delete this variation?')) {
      const newSegments = [...segments];
      newSegments[segmentIndex].variations.splice(variationIndex, 1);
      setSegments(newSegments);
    }
  };

  const updatePreview = () => {
    const message = generateMessage();
    setPreview(message);
  };

  const generateMessage = () => {
    return segments.map(segment => {
      const randomIndex = Math.floor(Math.random() * segment.variations.length);
      return segment.variations[randomIndex];
    }).join(' ');
  };

  const handleCSVUpload = (uploadedContacts) => {
    setContacts(uploadedContacts);
  };

  return (
    <div className="container mx-auto px-4">
      <header className="py-6">
        <h1 className="text-2xl font-bold">Message Template Generator</h1>
      </header>
      
      <div className="space-y-6">
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Message Template</h2>
            <button 
              className="btn btn-primary"
              onClick={addSegment}
            >
              Add Segment
            </button>
          </div>
          <div id="templateBuilder" className="space-y-4">
            {segments.map((segment, segmentIndex) => (
              <div key={segmentIndex} className="bg-gray-100 p-4 rounded">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">{segment.name}</h3>
                  <button className="btn btn-secondary" onClick={() => addVariation(segmentIndex)}>Add Variation</button>
                </div>
                <div id={`variations-${segmentIndex}`} className="space-y-2">
                  {segment.variations.map((variation, varIndex) => (
                    <div key={varIndex} className="flex justify-between items-center bg-white p-2 rounded">
                      <span>{variation}</span>
                      <div>
                        <button className="text-blue-500 hover:text-blue-700 mr-2" onClick={() => editVariation(segmentIndex, varIndex)}>
                          <i className="fas fa-edit"></i>
                        </button>
                        <button className="text-red-500 hover:text-red-700" onClick={() => deleteVariation(segmentIndex, varIndex)}>
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Message Preview</h2>
          <div id="messagePreview" className="bg-gray-100 p-4 rounded mb-2">{preview}</div>
          <div id="characterCount" className="text-right text-gray-600">{preview.length}/160 characters</div>
        </div>

        <CSVUploader onUpload={handleCSVUpload} />
      </div>
    </div>
  );
};

export default Templates;
