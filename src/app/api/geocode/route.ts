import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { address } = await req.json();
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!address) {
      return NextResponse.json({ error: 'O endereço é obrigatório.' }, { status: 400 });
    }
    if (!apiKey) {
        return NextResponse.json({ error: 'A chave da API do Google Maps não está configurada.' }, { status: 500 });
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK') {
      const location = data.results[0].geometry.location;
      return NextResponse.json({ lat: location.lat, lng: location.lng });
    } else {
      return NextResponse.json({ error: data.error_message || 'Falha ao buscar coordenadas.' }, { status: 500 });
    }
  } catch (error) {
    console.error("Erro no geocoding:", error);
    return NextResponse.json({ error: 'Falha interna do servidor.' }, { status: 500 });
  }
}