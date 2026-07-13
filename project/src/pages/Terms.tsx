import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export function TermsPage() {
  return (
    <div className="min-h-screen p-4 md:p-8 max-w-3xl mx-auto">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> Назад
      </Link>

      <h1 className="text-3xl font-extrabold mb-2">Пользовательское соглашение и публичная оферта</h1>
      <p className="text-sm text-muted-foreground mb-8">Последнее обновление: июнь 2026</p>

      <div className="space-y-6 text-sm leading-7 text-muted-foreground">
        <section>
          <h2 className="text-base font-bold text-foreground mb-2">1. Общие положения</h2>
          <p>
            Настоящее Пользовательское соглашение (далее — «Соглашение») является публичной офертой от FlowDesk (далее — «Сервис»), адресованной физическим и юридическим лицам (далее — «Пользователь»). Регистрация или использование Сервиса означает полное согласие с условиями настоящего Соглашения.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-foreground mb-2">2. Предмет Соглашения</h2>
          <p>
            Сервис предоставляет облачную CRM-платформу и систему управления записями. Доступ предоставляется на основе подписки после 7-дневного бесплатного пробного периода.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-foreground mb-2">3. Пробный период</h2>
          <p>
            При регистрации каждому Пользователю предоставляется 7-дневный пробный период с полным доступом ко всем функциям Pro. После окончания пробного периода аккаунт автоматически переводится на бесплатный тариф, если подписка не активирована.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-foreground mb-2">4. Подписка и оплата</h2>
          <p className="font-medium text-foreground mb-2">
            Активируя подписку Pro, вы соглашаетесь на автоматическое ежемесячное списание 490 ₽ (четыреста девяносто рублей) с привязанного способа оплаты.
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Списание производится ежемесячно в дату первой оплаты.</li>
            <li>Оплата обрабатывается через ЮKassa (ООО НКО «ЮМани»), лицензированный платежный сервис.</li>
            <li>Период подписки составляет 30 календарных дней с даты оплаты.</li>
            <li>При успешной оплате доступ к Pro-функциям активируется мгновенно.</li>
            <li>При неудачной оплате аккаунт переводится на бесплатный тариф.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-foreground mb-2">5. Отмена и возврат средств</h2>
          <p>
            Вы можете отменить подписку в любое время на странице Профиля. После отмены доступ к Pro сохраняется до конца текущего расчетного периода. Частичный возврат за неиспользованные дни не предоставляется. Если вы считаете, что списание произошло ошибочно, свяжитесь с поддержкой в течение 14 дней после списания.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-foreground mb-2">6. Ограничения бесплатного тарифа</h2>
          <p>На бесплатном тарифе действуют следующие ограничения:</p>
          <ul className="list-disc list-inside space-y-1 ml-2 mt-1">
            <li>Максимум 10 клиентов</li>
            <li>Максимум 20 записей в месяц</li>
            <li>Нет доступа к аналитике и отчетам</li>
            <li>Нет экспорта данных</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-foreground mb-2">7. Данные пользователя</h2>
          <p>
            Все данные, введенные Пользователем (карточки клиентов, записи, услуги), хранятся в облаке и доступны только Пользователю. FlowDesk не передает персональные данные третьим лицам, за исключением случаев, предусмотренных законом. Данные сохраняются в течение 90 дней после удаления аккаунта.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-foreground mb-2">8. Ограничение ответственности</h2>
          <p>
            Сервис предоставляется «как есть». FlowDesk не несет ответственности за упущенную выгоду, пропущенные записи или другие косвенные убытки, возникшие в результате использования или невозможности использования Сервиса. Общая ответственность ограничена суммой, уплаченной Пользователем за последние 30 дней.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-foreground mb-2">9. Изменения условий</h2>
          <p>
            FlowDesk оставляет за собой право изменять настоящее Соглашение в любое время. Изменения вступают в силу через 7 дней после публикации на данной странице. Продолжение использования Сервиса означает принятие измененных условий.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-foreground mb-2">10. Контакты</h2>
          <p>
            По вопросам, связанным с Соглашением, подписками или возвратами, свяжитесь с нами через Telegram:{' '}
            <a href="https://t.me/flowdesk_bot" className="text-primary underline" target="_blank" rel="noreferrer">
              @flowdesk_bot
            </a>
          </p>
        </section>
      </div>

      <div className="mt-10 pt-6 border-t border-border/30 text-xs text-muted-foreground">
        FlowDesk — CRM и управление записями для бизнеса
      </div>
    </div>
  )
}
