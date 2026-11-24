/**
 * Jelajah.id - In-Memory State & Initial Data Store
 * Prepared for future REST API / Database integration
 */
// In-memory data store with sensible default mockups
    const state = {
      places: [
        {
          id: 'p-1',
          type: 'kuliner',
          name: 'Warung Nasi Campur Bali',
          city: 'Denpasar',
          location: 'https://maps.google.com/?q=Sanur+Denpasar',
          videos: [
            'https://www.youtube.com/watch?v=review-warung-bali',
            'https://www.youtube.com/watch?v=vlog-kuliner-sanur'
          ],
          videoUrl: 'https://www.youtube.com/watch?v=review-warung-bali',
          photos: [
            'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80'
          ]
        },
        {
          id: 'p-2',
          type: 'kuliner',
          name: 'Kopi Klotok Pakem',
          city: 'Yogyakarta',
          location: 'https://maps.google.com/?q=Kopi+Klotok+Pakem+Sleman',
          videoUrl: '',
          photos: [
            'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80'
          ]
        },
        {
          id: 'p-3',
          type: 'wisata',
          name: 'Kelingking Beach Nusa Penida',
          city: 'Bali',
          location: 'https://maps.google.com/?q=Kelingking+Beach+Nusa+Penida',
          videos: [
            'https://www.youtube.com/watch?v=kelingking-drone-view'
          ],
          videoUrl: 'https://www.youtube.com/watch?v=kelingking-drone-view',
          photos: [
            'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=600&q=80'
          ]
        },
        {
          id: 'p-4',
          type: 'wisata',
          name: 'Gunung Bromo Sunrise Tour',
          city: 'Probolinggo',
          location: 'https://maps.google.com/?q=Gunung+Bromo+Indonesia',
          videos: [
            'https://www.youtube.com/watch?v=bromo-sunrise-trip'
          ],
          videoUrl: 'https://www.youtube.com/watch?v=bromo-sunrise-trip',
          photos: [
            'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80'
          ]
        }
      ],
      wishlist: [
        {
          id: 'w-1',
          placeId: 'p-3',
          name: 'Kelingking Beach Nusa Penida',
          city: 'Bali',
          location: 'https://maps.google.com/?q=Kelingking+Beach+Nusa+Penida',
          category: 'Tempat Wisata',
          departureDate: '2026-12-15',
          notes: 'Trekking Padar saat sunrise dan snorkeling bareng Manta.',
          completed: false
        },
        {
          id: 'w-2',
          placeId: 'p-1',
          name: 'Warung Nasi Campur Bali',
          city: 'Denpasar',
          location: 'https://maps.google.com/?q=Sanur+Denpasar',
          category: 'Tempat Makan',
          departureDate: '2026-11-28',
          notes: 'Beli sate lilit dan sambal matah khas Sanur.',
          completed: false
        }
      ],
      history: [
        {
          id: 'h-1',
          placeId: null,
          name: 'Candi Prambanan Sunset',
          city: 'Sleman',
          location: 'Klaten / Sleman',
          category: 'Tempat Wisata',
          departureDate: '2026-10-12',
          completedAt: '2026-10-12',
          notes: 'Nonton Sendratari Ramayana malam hari.',
          gdriveUrl: '',
          gdriveLinks: []
        }
      ]
    };


    // TAB SWITCHING
