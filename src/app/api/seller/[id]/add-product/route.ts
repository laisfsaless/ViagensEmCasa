import { NextRequest, NextResponse } from 'next/server';
import { firestore, storage } from '../../../../../services/database/firebaseAdmin'; // Certifique-se de que o caminho está correto
import { FieldValue } from 'firebase-admin/firestore';
import { auth } from '@/services/auth/auth';

export async function POST(req: NextRequest) {
  try {
  
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }


    const formData = await req.formData();
    const productName = formData.get('productName') as string;
    const description = formData.get('description') as string;
    const price = formData.get('price') as string;
    const category = formData.get('category') as string;
    const image = formData.get('image') as File | null;

    console.log("Dados recebidos:", { productName, description, price, category, image });

    let imageUrl = null;
    if (image) {

      const storageRef = storage.file(`products/${image.name}`);
      await storageRef.save(Buffer.from(await image.arrayBuffer()), {
        contentType: image.type,
      });
      const [url] = await storageRef.getSignedUrl({ action: 'read', expires: '03-01-2500' });
      imageUrl = url;
    }

    // Salvar os dados do produto no Firestore
    const docRef = await firestore.collection('products').add({
      productName,
      description,
      price,
      category,
      image: imageUrl, // Salvar o URL da imagem
      createdAt: FieldValue.serverTimestamp(),
    });

    console.log("Produto adicionado com sucesso, ID:", docRef.id);
    return NextResponse.json({ message: 'Produto adicionado com sucesso', id: docRef.id }, { status: 200 });
  } catch (error) {
    console.error("Erro ao adicionar produto:", error);
    return NextResponse.json({ message: 'Erro ao adicionar produto', error: (error as Error).message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Método não permitido' }, { status: 405 });
}