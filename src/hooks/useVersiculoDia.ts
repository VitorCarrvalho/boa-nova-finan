import { useQuery } from '@tanstack/react-query';

interface Versiculo {
  text: string;
  reference: string;
}

// Lista de versículos em português (NVI) para fallback
const versiculosFallback: Versiculo[] = [
  {
    text: "Porque eu bem sei os pensamentos que tenho a vosso respeito, diz o Senhor; pensamentos de paz e não de mal, para vos dar o fim que esperais.",
    reference: "Jeremias 29:11"
  },
  {
    text: "Tudo posso naquele que me fortalece.",
    reference: "Filipenses 4:13"
  },
  {
    text: "O Senhor é o meu pastor; nada me faltará.",
    reference: "Salmos 23:1"
  },
  {
    text: "Entrega o teu caminho ao Senhor; confia nele, e ele o fará.",
    reference: "Salmos 37:5"
  },
  {
    text: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.",
    reference: "João 3:16"
  },
  {
    text: "Não se turbe o vosso coração; credes em Deus, crede também em mim.",
    reference: "João 14:1"
  },
  {
    text: "E sabemos que todas as coisas contribuem juntamente para o bem daqueles que amam a Deus.",
    reference: "Romanos 8:28"
  },
  {
    text: "O Senhor é a minha luz e a minha salvação; a quem temerei? O Senhor é a força da minha vida; de quem me recearei?",
    reference: "Salmos 27:1"
  }
];

const getVersiculoFromAPI = async (): Promise<Versiculo> => {
  try {
    // Tentar primeira API - Bible API
    const response = await fetch('https://bible-api.com/random?translation=nvi');
    if (response.ok) {
      const data = await response.json();
      return {
        text: data.text.trim(),
        reference: data.reference
      };
    }
  } catch (error) {
    console.log('Primeira API falhou, tentando segunda opção...');
  }

  try {
    // Tentar segunda API - Labs Bible API
    const response = await fetch('https://labs.bible.org/api/?passage=random&type=json');
    if (response.ok) {
      const data = await response.json();
      if (data && data[0]) {
        return {
          text: data[0].text.trim(),
          reference: `${data[0].bookname} ${data[0].chapter}:${data[0].verse}`
        };
      }
    }
  } catch (error) {
    console.log('Segunda API falhou, usando versículo do cache...');
  }

  // Fallback para versículo local
  const hoje = new Date().getDate();
  const index = hoje % versiculosFallback.length;
  return versiculosFallback[index];
};

const getVersiculoFromCache = (): Versiculo | null => {
  try {
    const cached = localStorage.getItem('versiculo_dia');
    const today = new Date().toDateString();
    
    if (cached) {
      const { data, date } = JSON.parse(cached);
      if (date === today) {
        return data;
      }
    }
  } catch (error) {
    console.error('Erro ao ler cache do versículo:', error);
  }
  return null;
};

const saveVersiculoToCache = (versiculo: Versiculo): void => {
  try {
    const today = new Date().toDateString();
    localStorage.setItem('versiculo_dia', JSON.stringify({
      data: versiculo,
      date: today
    }));
  } catch (error) {
    console.error('Erro ao salvar versículo no cache:', error);
  }
};

export const useVersiculoDia = () => {
  return useQuery({
    queryKey: ['versiculo-dia'],
    queryFn: async (): Promise<Versiculo> => {
      // Primeiro, tentar buscar do cache
      const cached = getVersiculoFromCache();
      if (cached) {
        return cached;
      }

      // Se não tem no cache, buscar da API
      const versiculo = await getVersiculoFromAPI();
      
      // Salvar no cache
      saveVersiculoToCache(versiculo);
      
      return versiculo;
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 horas
    gcTime: 24 * 60 * 60 * 1000, // 24 horas
  });
};