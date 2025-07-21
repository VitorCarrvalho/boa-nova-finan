
import { useQuery } from '@tanstack/react-query';

interface Versiculo {
  text: string;
  reference: string;
}

// Lista expandida de versículos em português (NVI) para uso local
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
    text: "Não andem ansiosos por coisa alguma, mas em tudo, pela oração e súplicas, e com ação de graças, apresentem seus pedidos a Deus.",
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
  },
  {
    text: "O coração do homem pode fazer planos, mas a resposta certa dos lábios vem do Senhor.",
    reference: "Provérbios 16:1"
  },
  {
    text: "Por isso não tema, pois estou com você; não tenha medo, pois sou o seu Deus. Eu o fortalecerei e o ajudarei; eu o segurarei com a minha mão direita vitoriosa.",
    reference: "Isaías 41:10"
  },
  {
    text: "Busquem, pois, em primeiro lugar o Reino de Deus e a sua justiça, e todas essas coisas lhes serão acrescentadas.",
    reference: "Mateus 6:33"
  },
  {
    text: "Tenham misericórdia de mim, ó Deus, segundo a tua benignidade; apaga as minhas transgressões, segundo a multidão das tuas misericórdias.",
    reference: "Salmos 51:1"
  },
  {
    text: "Porque pela graça sois salvos, por meio da fé; e isto não vem de vós, é dom de Deus.",
    reference: "Efésios 2:8"
  },
  {
    text: "O Senhor abençoe você e o guarde; o Senhor faça resplandecer o seu rosto sobre você e tenha misericórdia de você.",
    reference: "Números 6:24-25"
  },
  {
    text: "Clame a mim e eu lhe responderei e lhe direi coisas grandiosas e insondáveis que você não conhece.",
    reference: "Jeremias 33:3"
  },
  {
    text: "Humilhem-se, pois, debaixo da poderosa mão de Deus, para que ele os exalte no tempo devido.",
    reference: "1 Pedro 5:6"
  },
  {
    text: "Aquele que habita no abrigo do Altíssimo e descansa à sombra do Todo-poderoso.",
    reference: "Salmos 91:1"
  },
  {
    text: "Jesus respondeu: 'Eu sou o caminho, a verdade e a vida. Ninguém vem ao Pai, a não ser por mim.'",
    reference: "João 14:6"
  }
];

// Função para verificar se o texto está em português
const isPortuguese = (text: string): boolean => {
  const portugueseWords = ['que', 'para', 'com', 'não', 'seu', 'sua', 'ele', 'ela', 'deus', 'senhor', 'você', 'vocês', 'mim', 'nos'];
  const textLower = text.toLowerCase();
  return portugueseWords.some(word => textLower.includes(word));
};

const getVersiculoFromAPI = async (): Promise<Versiculo> => {
  console.log('🔍 Tentando buscar versículo da API brasileira...');
  
  try {
    // Tentar API brasileira (português)
    const response = await fetch('https://www.abibliadigital.com.br/api/verses/nvi/random');
    
    if (response.ok) {
      const data = await response.json();
      console.log('📡 Resposta da API:', data);
      
      if (data && data.text && data.reference) {
        const versiculo = {
          text: data.text.trim(),
          reference: data.reference
        };
        
        // Verificar se o texto está em português
        if (isPortuguese(versiculo.text)) {
          console.log('✅ Versículo da API em português:', versiculo.reference);
          return versiculo;
        } else {
          console.log('❌ Versículo da API não está em português, usando fallback local');
        }
      }
    }
  } catch (error) {
    console.log('❌ Erro na API brasileira:', error);
  }

  // Fallback para versículo local aleatório
  console.log('🏠 Usando versículo aleatório do cache local...');
  const randomIndex = Math.floor(Math.random() * versiculosNVI.length);
  const versiculoLocal = versiculosNVI[randomIndex];
  console.log('📖 Versículo local selecionado:', versiculoLocal.reference);
  return versiculoLocal;
};

const getVersiculoFromCache = (): Versiculo | null => {
  try {
    const cached = localStorage.getItem('versiculo_dia');
    const today = new Date().toDateString();
    
    if (cached) {
      const { data, date } = JSON.parse(cached);
      
      // Verificar se é do dia atual E se está em português
      if (date === today && data && isPortuguese(data.text)) {
        console.log('💾 Versículo encontrado no cache (português):', data.reference);
        return data;
      } else if (date === today && data && !isPortuguese(data.text)) {
        console.log('🗑️ Removendo versículo em inglês do cache...');
        localStorage.removeItem('versiculo_dia');
      }
    }
  } catch (error) {
    console.error('❌ Erro ao ler cache do versículo:', error);
    localStorage.removeItem('versiculo_dia');
  }
  return null;
};

const saveVersiculoToCache = (versiculo: Versiculo): void => {
  try {
    // Só salvar no cache se estiver em português
    if (isPortuguese(versiculo.text)) {
      const today = new Date().toDateString();
      localStorage.setItem('versiculo_dia', JSON.stringify({
        data: versiculo,
        date: today
      }));
      console.log('💾 Versículo salvo no cache:', versiculo.reference);
    } else {
      console.log('⚠️ Não salvando versículo em inglês no cache');
    }
  } catch (error) {
    console.error('❌ Erro ao salvar versículo no cache:', error);
  }
};

// Função para forçar um novo versículo (usado pelo botão refresh)
const forceNewVerse = async (): Promise<Versiculo> => {
  console.log('🔄 Forçando busca de novo versículo...');
  
  // Limpar cache existente
  localStorage.removeItem('versiculo_dia');
  
  // Buscar novo versículo
  const versiculo = await getVersiculoFromAPI();
  
  // Salvar no cache
  saveVersiculoToCache(versiculo);
  
  return versiculo;
};

export const useVersiculoDia = () => {
  return useQuery({
    queryKey: ['versiculo-dia'],
    queryFn: async (): Promise<Versiculo> => {
      console.log('🚀 Iniciando busca por versículo do dia...');
      
      // Primeiro, tentar buscar do cache
      const cached = getVersiculoFromCache();
      if (cached) {
        return cached;
      }

      // Se não tem no cache, buscar da API
      const versiculo = await getVersiculoFromAPI();
      
      // Salvar no cache apenas se estiver em português
      saveVersiculoToCache(versiculo);
      
      return versiculo;
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 horas
    gcTime: 24 * 60 * 60 * 1000, // 24 horas
  });
};

// Hook personalizado para forçar refresh
export const useRefreshVerse = () => {
  return {
    forceRefresh: forceNewVerse
  };
};
