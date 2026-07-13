TYPE=TRIGGERS
triggers='CREATE DEFINER=`root`@`localhost` TRIGGER trg_after_checkin_insert\nAFTER INSERT ON check_ins\nFOR EACH ROW\nBEGIN\n    UPDATE rooms \n    SET status = \'occupied\'\n    WHERE id = (SELECT room_id FROM bookings WHERE id = NEW.booking_id);\n    \n    UPDATE bookings \n    SET status = \'checked_in\'\n    WHERE id = NEW.booking_id;\nEND'
sql_modes=1411383296
definers='root@localhost'
client_cs_names='utf8mb4'
connection_cl_names='utf8mb4_general_ci'
db_cl_names='utf8mb4_general_ci'
created=1783952912248984
