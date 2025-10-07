import Link from 'next/link';
import Header from '../src/components/Header';
import Footer from '../src/components/Footer';
import MetaTags from '../src/components/MetaTags';

export default function HelpPage() {
  return (
    <>
      <MetaTags
        title="Help Center - PrimeAgents"
        description="Guide to using PrimeAgents. How to add an agent, moderation process, requirements and frequently asked questions."
        keywords="help, guide, FAQ, moderation, requirements, adding agents, support"
        url="https://primeagents.info/help"
        canonicalUrl="https://primeagents.info/help"
      />

      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Центр помощи</h1>
            <p className="text-lg text-gray-600">
              Все что нужно знать о PrimeAgents: от добавления агентов до использования платформы
            </p>
          </div>

          {/* Quick Navigation */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Быстрая навигация</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a href="#adding-agents" className="flex items-center p-3 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                </div>
                <span className="font-medium text-gray-900">Добавление агентов</span>
              </a>
              <a href="#moderation" className="flex items-center p-3 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <span className="font-medium text-gray-900">Процесс модерации</span>
              </a>
              <a href="#requirements" className="flex items-center p-3 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                </div>
                <span className="font-medium text-gray-900">Требования</span>
              </a>
              <a href="#faq" className="flex items-center p-3 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <span className="font-medium text-gray-900">Частые вопросы</span>
              </a>
            </div>
          </div>

          {/* Adding Agents Guide */}
          <section id="adding-agents" className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Руководство по добавлению агентов</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Шаг 1: Подготовка</h3>
                <p className="text-gray-600 mb-3">
                  Перед добавлением агента убедитесь, что у вас есть:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                  <li>Рабочий AI агент с доступным API или демо</li>
                  <li>Подробное описание возможностей агента</li>
                  <li>Документация по использованию</li>
                  <li>Скриншоты или демо-материалы</li>
                  <li>Контактная информация для связи</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Шаг 2: Заполнение формы</h3>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Основная информация</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li><strong>Название:</strong> Краткое и понятное название агента</li>
                    <li><strong>Описание:</strong> Подробное описание функций и возможностей</li>
                    <li><strong>Категория:</strong> Выберите наиболее подходящую категорию</li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Ценообразование</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li><strong>Модель:</strong> Бесплатно, Freemium, Подписка, Разовый платеж, По использованию</li>
                    <li><strong>Цена:</strong> Укажите стоимость в USD (если применимо)</li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Возможности и применение</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li><strong>Теги:</strong> Ключевые слова через запятую (AI, чат-бот, автоматизация)</li>
                    <li><strong>Возможности:</strong> Основные функции агента</li>
                    <li><strong>Сценарии использования:</strong> Где и как можно применить агента</li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Ссылки и медиа</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li><strong>Демо URL:</strong> Ссылка на рабочую демонстрацию</li>
                    <li><strong>API Endpoint:</strong> Адрес API для интеграции</li>
                    <li><strong>Документация:</strong> Ссылка на техническую документацию</li>
                    <li><strong>GitHub:</strong> Репозиторий с исходным кодом (если доступен)</li>
                    <li><strong>Логотип и скриншоты:</strong> Визуальные материалы</li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Шаг 3: Отправка</h3>
                <p className="text-gray-600 mb-3">
                  После заполнения всех обязательных полей:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-gray-600 ml-4">
                  <li>Проверьте правильность введенной информации</li>
                  <li>Согласитесь с условиями использования</li>
                  <li>Нажмите "Отправить на модерацию"</li>
                  <li>Получите подтверждение о получении заявки</li>
                </ol>
              </div>
            </div>

            <div className="mt-6 p-4 bg-primary-50 rounded-lg">
              <div className="flex items-start space-x-3">
                <svg className="w-6 h-6 text-primary-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Совет</h4>
                  <p className="text-sm text-gray-600">
                    Чем подробнее и качественнее вы заполните форму, тем быстрее пройдет модерация. 
                    Добавьте максимум полезной информации для пользователей.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Moderation Process */}
          <section id="moderation" className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Процесс модерации</h2>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-semibold text-sm">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Получение заявки (0-2 часа)</h3>
                  <p className="text-gray-600">
                    Ваша заявка поступает в очередь модерации. Вы получите email-подтверждение о получении.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-yellow-600 font-semibold text-sm">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Первичная проверка (2-12 часов)</h3>
                  <p className="text-gray-600 mb-2">
                    Модераторы проверяют:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 ml-4">
                    <li>Соответствие выбранной категории</li>
                    <li>Качество описания и информации</li>
                    <li>Работоспособность предоставленных ссылок</li>
                    <li>Соблюдение правил платформы</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 font-semibold text-sm">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Техническая проверка (12-24 часа)</h3>
                  <p className="text-gray-600 mb-2">
                    Тестирование функциональности:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 ml-4">
                    <li>Проверка работы демо-версии</li>
                    <li>Тестирование API (если предоставлен)</li>
                    <li>Оценка безопасности и стабильности</li>
                    <li>Проверка соответствия заявленным возможностям</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-semibold text-sm">4</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Решение (24-48 часов)</h3>
                  <p className="text-gray-600">
                    Вы получите уведомление о результате модерации. При одобрении агент появится в каталоге. 
                    При отклонении - подробные комментарии для доработки.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <div className="flex items-start space-x-3">
                <svg className="w-6 h-6 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Время модерации</h4>
                  <p className="text-sm text-gray-600">
                    Обычно процесс занимает 24-48 часов. В периоды высокой нагрузки может потребоваться до 72 часов.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Requirements */}
          <section id="requirements" className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Требования к агентам</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-green-600">✅ Разрешено</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start space-x-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Функциональные AI агенты с четким назначением</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Агенты для автоматизации бизнес-процессов</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Образовательные и исследовательские инструменты</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Творческие и развлекательные AI решения</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Инструменты для разработчиков и аналитиков</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Агенты с открытым исходным кодом</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-red-600">❌ Запрещено</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start space-x-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>Вредоносное ПО и агенты для взлома</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>Агенты для создания фейковых новостей</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>Инструменты для спама и мошенничества</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>Агенты с дискриминационным контентом</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>Нефункциональные или поддельные агенты</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>Агенты, нарушающие авторские права</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-start space-x-3">
                <svg className="w-6 h-6 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Важно</h4>
                  <p className="text-sm text-gray-600">
                    Агенты должны соответствовать законодательству и этическим нормам. 
                    Мы оставляем за собой право отклонить любой агент, который может причинить вред пользователям.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Часто задаваемые вопросы</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Сколько стоит размещение агента?</h3>
                <p className="text-gray-600">
                  Размещение агентов на PrimeAgents бесплатно. Мы берем комиссию только с платных агентов при продаже.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Можно ли редактировать агента после публикации?</h3>
                <p className="text-gray-600">
                  Да, вы можете обновлять информацию о своем агенте. Значительные изменения могут потребовать повторной модерации.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Что делать, если агент был отклонен?</h3>
                <p className="text-gray-600">
                  Вы получите подробные комментарии о причинах отклонения. Исправьте указанные проблемы и подайте заявку повторно.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Как продвигать своего агента?</h3>
                <p className="text-gray-600">
                  Качественное описание, скриншоты, активное взаимодействие с пользователями и регулярные обновления помогут повысить популярность агента.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Поддерживаются ли агенты на других языках?</h3>
                <p className="text-gray-600">
                  Да, мы принимаем агентов на любых языках. Рекомендуем предоставлять описание на английском или русском языке для лучшей доступности.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Как связаться с поддержкой?</h3>
                <p className="text-gray-600">
                  Вы можете написать нам на <a href="mailto:support@primeagents.com" className="text-primary-600 hover:text-primary-700">support@primeagents.com</a> или использовать форму обратной связи на сайте.
                </p>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <div className="bg-primary-600 rounded-lg p-6 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Готовы добавить своего агента?</h2>
            <p className="text-primary-100 mb-6">
              Поделитесь своим AI решением с сообществом разработчиков и пользователей
            </p>
            <Link 
              href="/add-agent" 
              className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Добавить агента
            </Link>
          </div>

          {/* Contact Support */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">Не нашли ответ на свой вопрос?</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="mailto:support@primeagents.com" 
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                Написать в поддержку
              </a>
              <Link 
                href="/contact" 
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
                Форма обратной связи
              </Link>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
