import { GetServerSideProps } from 'next';

// Redirect from /agents/[slug] to /[slug]
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { slug } = context.params as { slug: string };

  return {
    redirect: {
      destination: `/${slug}`,
      permanent: true,
    },
  };
};

export default function AgentsRedirect() {
  return null;
}

