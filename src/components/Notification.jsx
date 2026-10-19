const Notification = ({ notification }) => notification && (
  <div className={`notification ${notification.type}`} role={notification.type === 'error' ? 'alert' : 'status'}>
    {notification.message}
  </div>
)

export default Notification
