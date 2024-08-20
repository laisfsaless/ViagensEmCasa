import { NextRequest, NextResponse } from 'next/server';
import { firestore, storage } from '@/services/database/firebaseAdmin';

export async function GET() {
  try {
    const ticketsCollection = firestore.collection('Tickets');
    const ticketsSnapshot = await ticketsCollection.where('enabled', '==', true).get();

    const tickets = await Promise.all(
      ticketsSnapshot.docs.map(async (doc) => {
        const ticketData = doc.data();

        // Verificação se há imagens
        let imageUrls: string[] = [];
        if (ticketData.images && Array.isArray(ticketData.images)) {
          imageUrls = await Promise.all(
            ticketData.images.map(async (imagePath: string) => {
              try {
                const file = storage.file(imagePath);
                const [url] = await file.getSignedUrl({
                  action: 'read',
                  expires: '03-01-2500', // Long expiration date
                });
                return url;
              } catch (error) {
                console.error(`Failed to retrieve image at path ${imagePath}:`, error);
                return ''; // Retorna uma string vazia em caso de erro
              }
            })
          );
          // Filtra URLs vazias caso algum erro tenha ocorrido
          imageUrls = imageUrls.filter((url) => url !== '');
        }

        return {
          id: doc.id,
          ...ticketData,
          images: imageUrls, // URLs das imagens resgatadas
        };
      })
    );

    return NextResponse.json({ tickets }, { status: 200 });
  } catch (error) {
    console.error('Error fetching museum tickets:', error);
    return NextResponse.json({ error: 'Failed to fetch museum tickets' }, { status: 500 });
  }
}
