# PeerSMS Beta1

PeerSMS Beta1 is a powerful SMS survey application that allows you to create message templates, upload contacts via CSV, and generate personalized survey invitations.

## New Features

### CSV Contact Uploader
- Upload your contacts using a CSV file
- Preview the first 5 rows of the uploaded CSV
- Automatically process contacts for message generation

### Message Template Generator
- Create customizable message segments
- Add, edit, and delete variations for each segment
- Generate random message previews based on your segments
- Character count display for SMS length tracking

## How to Use

1. Navigate to the Templates page
2. Use the "Add Segment" button to create new message segments
3. Add variations to each segment using the "Add Variation" button
4. Upload your contacts CSV using the CSV Uploader
5. Generate personalized messages for each contact

## API Endpoints

- `POST /api/generate-templates`: Generate personalized message templates based on uploaded contacts and defined segments

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up your environment variables in `.env.local`
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Testing

Run the test suite using: `npm test`

## Contributing

Please read our contributing guidelines before submitting pull requests.

## License

This project is licensed under the MIT License.
