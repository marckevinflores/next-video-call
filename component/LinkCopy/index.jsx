import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Copy } from 'lucide-react';
import styles from '@/component/LinkCopy/index.module.css';

const LinkCopy = (props) => {
  const { roomId } = props;
  return (
    <div className={styles.copyContainer}>
      <p className='text-sm'>Copy Room ID:</p>
      <hr />
      <div className={styles.copyDescription}>
        <span>{roomId}</span>
        <CopyToClipboard text={roomId}>
          <Copy></Copy>
        </CopyToClipboard>
      </div>
    </div>
  );
};
export default LinkCopy;
