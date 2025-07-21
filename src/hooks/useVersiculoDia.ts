import { useQuery } from '@tanstack/react-query';

interface Versiculo {
  text: string;
  reference: string;
}

// Lista de versículos em português (NVI) para uso
const versiculosNVI: Versiculo[] = [
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
    text: "Porque Deus tanto amou o mundo que deu o seu Filho unigênito, para que todo o que nele crer não pereça, mas tenha a vida eterna.",
    reference: "João 3:16"
  },
  {
    text: "Não se turbe o vosso coração; credes em Deus, crede também em mim.",
    reference: "João 14:1"
  },
  {
    text: "Sabemos que todas as coisas cooperam para o bem daqueles que amam a Deus, daqueles que são chamados segundo o seu propósito.",
    reference: "Romanos 8:28"
  },
  {
    text: "O Senhor é a minha luz e a minha salvação; de quem terei medo? O Senhor é o meu forte refúgio; de quem terei temor?",
    reference: "Salmos 27:1"
  },
  {
    text: "Venham a mim, todos os que estão cansados e sobrecarregados, e eu lhes darei descanso.",
    reference: "Mateus 11:28"
  },
  {
    text: "Em tudo sou grato; não andem ansiosos por coisa alguma, mas em tudo, pela oração e súplicas, e com ação de graças, apresentem seus pedidos a Deus.",
    reference: "Filipenses 4:6"
  },
  {
    text: "A paz deixo com vocês; a minha paz lhes dou. Não a dou como o mundo a dá. Não se perturbe o coração de vocês, nem tenham medo.",
    reference: "João 14:27"
  },
  {
    text: "Se confessarmos os nossos pecados, ele é fiel e justo para perdoar os nossos pecados e nos purificar de toda injustiça.",
    reference: "1 João 1:9"
  },
  {
    text: "Sejam fortes e corajosos! Não tenham medo nem desanimem, pois o Senhor, o seu Deus, estará com vocês por onde forem.",
    reference: "Josué 1:9"
  },
  {
    text: "O amor é paciente, o amor é bondoso. Não inveja, não se vangloria, não se orgulha.",
    reference: "1 Coríntios 13:4"
  },
  {
    text: "Confie no Senhor de todo o coração e não se apoie em seu próprio entendimento.",
    reference: "Provérbios 3:5"
  },
  {
    text: "Pois eu sou o Senhor, o seu Deus, que segura a sua mão direita e lhe diz: Não tema; eu o ajudarei.",
    reference: "Isaías 41:13"
  },
  {
    text: "Alegrem-se sempre no Senhor. Novamente digo: alegrem-se!",
    reference: "Filipenses 4:4"
  },
  {
    text: "Lancem sobre ele toda a sua ansiedade, porque ele tem cuidado de vocês.",
    reference: "1 Pedro 5:7"
  },
  {
    text: "O Senhor lutará por vocês; vocês só precisam ficar quietos.",
    reference: "Êxodo 14:14"
  },
  {
    text: "Mas os que esperam no Senhor renovam as suas forças. Voam alto como águias; correm e não ficam exaustos, andam e não se cansam.",
    reference: "Isaías 40:31"
  }
];

const getVersiculoFromAPI = async (): Promise<Versiculo> => {
  try {
    // Tentar API brasileira (português)
    const response = await fetch('https://www.abibliadigital.com.br/api/verses/nvi/random');
    if (response.ok) {
      const data = await response.json();
      if (data && data.text && data.reference) {
        return {
          text: data.text.trim(),
          reference: data.reference
        };
      }
    }
  } catch (error) {
    console.log('API brasileira falhou, usando versículo do cache local...');
  }

  // Fallback para versículo local em português
  const hoje = new Date().getDate();
  const index = hoje % versiculosNVI.length;
  return versiculosNVI[index];
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